"""
Tests for persistence, resumability and the service (Lesson 14).
"""

import json
import tempfile
from pathlib import Path

import pytest

from agent.approval import read_audit, reset_state
from agent.persistence import (
    PROMPT_VERSION, TOOLSET_VERSION, RunRecord, RunStore, can_resume,
)
from service import api

GOAL = "Triage ticket TCK-1001 and recommend the next step."


@pytest.fixture
def store(tmp_path: Path) -> RunStore:
    return RunStore(tmp_path)


@pytest.fixture(autouse=True)
def _clean():
    reset_state()
    yield
    reset_state()


# -- persistence -----------------------------------------------------------
def test_a_run_round_trips(store):
    record = RunRecord(run_id="run_abc123", goal=GOAL, step=3,
                       facts={"read_ticket": {"ticket_id": "TCK-1001"}})
    store.save(record)
    back = store.load("run_abc123")
    assert back.goal == GOAL and back.step == 3
    assert back.facts["read_ticket"]["ticket_id"] == "TCK-1001"


def test_saving_is_atomic(store):
    """A half-written state file parses as corrupt or, worse, as plausible."""
    record = RunRecord(run_id="run_atomic01", goal=GOAL)
    store.save(record)
    store.save(record)
    assert not list(store.dir.glob("*.tmp")), "no temp files may survive a save"
    assert json.loads((store.dir / "run_atomic01.json").read_text(encoding="utf-8"))


def test_an_unsafe_run_id_is_rejected(store):
    """The run id arrives from an HTTP path parameter, so it is untrusted."""
    for bad in ("../../../etc/passwd", "run/../../x", "run id", "run;rm"):
        with pytest.raises(ValueError):
            store.load(bad)


def test_a_corrupt_file_does_not_break_the_listing(store):
    store.save(RunRecord(run_id="run_good0001", goal=GOAL))
    (store.dir / "run_corrupt.json").write_text("{not json", encoding="utf-8")
    assert [r.run_id for r in store.list_runs()] == ["run_good0001"]


def test_runs_can_be_listed_by_status(store):
    store.save(RunRecord(run_id="run_a0000001", goal=GOAL, status="running"))
    store.save(RunRecord(run_id="run_b0000001", goal=GOAL, status="done"))
    assert len(store.list_runs(status="running")) == 1
    assert len(store.list_runs()) == 2


def test_a_missing_run_is_none_not_an_exception(store):
    assert store.load("run_nothere01") is None


# -- resumability ----------------------------------------------------------
def test_an_interrupted_run_is_resumable():
    record = RunRecord(run_id="run_x", goal=GOAL, status="running", step=2)
    ok, why = can_resume(record)
    assert ok and why == "resumable"


def test_a_finished_run_is_not_resumable():
    for status in ("done", "abandoned"):
        ok, why = can_resume(RunRecord(run_id="run_x", goal=GOAL, status=status))
        assert not ok and status in why


def test_a_prompt_version_change_blocks_resume():
    """
    A run started under one prompt and finished under another has behaviour no
    trace will explain. Refusing is cheap.
    """
    record = RunRecord(run_id="run_x", goal=GOAL, status="running",
                       prompt_version="2020-01-01.0")
    ok, why = can_resume(record)
    assert not ok
    assert "prompt version changed" in why


def test_a_toolset_version_change_blocks_resume():
    record = RunRecord(run_id="run_x", goal=GOAL, status="running",
                       toolset_version="2020-01-01.0")
    ok, why = can_resume(record)
    assert not ok and "toolset version" in why


def test_an_unresumable_run_is_abandoned_with_its_facts(monkeypatch, tmp_path):
    """Handing a human the established facts beats starting from nothing."""
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    api.STORE.save(RunRecord(run_id="run_stale0001", goal=GOAL, status="running",
                             step=2, facts={"read_ticket": {"x": 1}},
                             prompt_version="2020-01-01.0"))
    out = api.resume_run("run_stale0001")
    assert out["status"] == "abandoned"
    assert out["established"] == ["read_ticket"]
    assert api.STORE.load("run_stale0001").status == "abandoned"


# -- the service -----------------------------------------------------------
def test_submitting_a_run_persists_before_and_after(monkeypatch, tmp_path):
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    out = api.submit_triage(GOAL)
    assert out["outcome"] == "resolved"
    stored = api.STORE.load(out["run_id"])
    assert stored.status == "done"
    assert stored.answer == out["answer"]


def test_every_response_carries_its_provenance(monkeypatch, tmp_path):
    """An answer must be attributable to a configuration after the fact."""
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    out = api.submit_triage(GOAL)
    assert out["prompt_version"] == PROMPT_VERSION
    assert out["toolset_version"] == TOOLSET_VERSION


def test_reading_an_unknown_run_is_a_clean_error(monkeypatch, tmp_path):
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    assert api.get_run("run_missing01")["error"] == "not_found"


def test_the_service_prepares_a_refund_but_never_pays(monkeypatch, tmp_path):
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    out = api.request_refund("run_r0000001", "ORD-5581", 120.0, "duplicate charge")
    assert out["status"] == "awaiting_approval"
    assert out["idempotency_key"]
    assert not [r for r in read_audit(50) if r["outcome"] == "executed"]


def test_a_policy_breaking_refund_is_rejected_before_a_human_is_asked(monkeypatch, tmp_path):
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    out = api.request_refund("run_r0000002", "ORD-5555", 49.0, "ninety days old")
    assert out["status"] == "rejected"
    assert out["error"] == "policy_denied"


def test_approval_is_a_separate_request_and_pays_once(monkeypatch, tmp_path):
    """The gate only becomes real over HTTP: a different request, by a human."""
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    api.request_refund("run_r0000003", "ORD-5581", 120.0, "duplicate charge")
    first = api.approve_refund("run_r0000003", "ORD-5581", 120.0, "alice", "duplicate charge")
    second = api.approve_refund("run_r0000003", "ORD-5581", 120.0, "alice", "duplicate charge")
    assert first["refunded"] is True and first.get("duplicate") is False
    assert second["duplicate"] is True
    assert len([r for r in read_audit(50) if r["outcome"] == "executed"]) == 1


def test_the_service_context_cannot_execute_refunds_itself():
    """This service prepares; only the human approval endpoint pays."""
    assert api.DEFAULT_CONTEXT["may_execute"] is False


def test_the_run_status_reflects_the_approval_gate(monkeypatch, tmp_path):
    monkeypatch.setattr(api, "STORE", RunStore(tmp_path))
    api.STORE.save(RunRecord(run_id="run_gate00001", goal=GOAL, status="running"))
    api.request_refund("run_gate00001", "ORD-5581", 120.0, "duplicate charge")
    assert api.STORE.load("run_gate00001").status == "awaiting_approval"
