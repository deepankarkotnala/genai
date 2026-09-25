#!/usr/bin/env python3
"""Pre-deployment validator for the GenAI Learning Portal.

Reads the single curriculum manifest through tools/curriculum-export.js -- it
never parses JavaScript itself -- and checks the repository against it.

Checks are gated by release stage, so this can pass against the repository as
Release 1 left it while still describing the rules that later stages enforce:

  stage 2a  manifest + validator exist; nothing renders from them
  stage 2b  every page declares data-curriculum-id; required fallbacks exist
  stage 2c  rendered navigation agrees with the manifest
  stage 2e  published metrics agree with computed metrics
  stage 2f  route resolution behaviour is exercised

Usage:
  python tools/validate.py --stage 2a
  python tools/validate.py --stage 2a --skip-tests
  python tools/validate.py --stage 2e --json
"""
from __future__ import annotations

import argparse
import collections
import html as htmlmod
import io
import json
import os
import re
import subprocess
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", "tools", "docs"}
STAGES = ["2a", "2b", "2c", "2d", "2e", "2f", "3", "3.1"]

# Blocks that are deliberately not valid standalone Python. Each is labelled on
# the page itself; see Release 1 item 7. The count is exact so a new invalid
# block cannot hide behind an existing allowance.
PY_EXCERPT_ALLOWLIST = {
    "guardrails.html": {
        "count": 1,
        "reason": "input scope gate: `return` belongs to the request handler the excerpt sits in; "
                  "labelled in the code header",
    },
    "teach-agents/lessons/0009-security.html": {
        "count": 1,
        "reason": "injection test: `{..., \"amount\": ...}` is deliberate shorthand for the arguments "
                  "shown earlier; labelled with a leading comment",
    },
    "teach-agents/lessons/0009-security.html": {
        "count": 1,
        "reason": "regression test excerpt: `{..., \"amount\": ...}` stands in for the arguments "
                  "shown earlier; labelled 'Concept excerpt' in the block itself",
    },
    "teach-agents/campusx/12-mcp.html": {
        "count": 1,
        "reason": "section 2 shows three teams' signatures side by side in columns to make the "
                  "duplication visible; labelled by a leading comment on the block",
    },
    "modules/09_mcp.html": {
        "count": 1,
        "reason": "section 2 shows three teams' signatures side by side in columns to make the "
                  "duplication visible; labelled by the per-column header comments",
    },
}

INELIGIBLE_FOR_PUBLIC_ROUTE = {"migration", "private", "optional-track"}


# --------------------------------------------------------------------------- io
def read(path: str) -> str:
    """Missing files return "" so one absent page cannot abort the whole report.

    registry-to-disk is the check that names them; every other check then sees an
    empty document and reports its own consequence, which is far more useful than
    a traceback from whichever check happened to run first.
    """
    try:
        with io.open(path, encoding="utf-8", errors="ignore", newline="") as fh:
            return fh.read()
    except FileNotFoundError:
        return ""


def html_pages() -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for name in sorted(filenames):
            if name.endswith(".html"):
                out.append(os.path.relpath(os.path.join(dirpath, name), ROOT).replace(os.sep, "/"))
    return sorted(out)


def load_manifest() -> dict:
    try:
        proc = subprocess.run(["node", os.path.join(ROOT, "tools", "curriculum-export.js")],
                              capture_output=True, text=True, encoding="utf-8")
    except FileNotFoundError:
        sys.exit("FATAL: node is not on PATH. The manifest is JavaScript and Python must not "
                 "parse it; install Node or run the validator where Node is available.")
    if proc.returncode != 0:
        sys.exit("FATAL: curriculum-export.js failed:\n" + (proc.stderr or "")[:4000])
    return json.loads(proc.stdout)


# ------------------------------------------------------------------- reporting
class Report:
    def __init__(self, stage: str):
        self.stage = stage
        self.rows: list[dict] = []

    def add(self, name: str, severity: str, ok: bool, detail: str = "", items=None):
        """severity: 'fail' | 'report' | 'skip' -- the effective severity at this stage."""
        self.rows.append({"check": name, "severity": severity, "ok": ok,
                          "detail": detail, "items": list(items or [])[:40]})

    @property
    def failures(self):
        return [r for r in self.rows if r["severity"] == "fail" and not r["ok"]]

    @property
    def warnings(self):
        return [r for r in self.rows if r["severity"] == "report" and not r["ok"]]


def sev(report: Report, enforced_from: str | None) -> str:
    """'fail' once the stage reaches enforced_from; 'report' before; 'skip' if None."""
    if enforced_from is None:
        return "skip"
    return "fail" if STAGES.index(report.stage) >= STAGES.index(enforced_from) else "report"


# ------------------------------------------------------------------ link checks
def check_links(rep: Report, pages: list[str]):
    ids: dict[str, set] = {}
    dup_rows = []
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        found = re.findall(r'\bid="([^"]+)"', src)
        dups = [i for i, c in collections.Counter(found).items() if c > 1]
        if dups:
            dup_rows.append("%s: %s" % (rel, ", ".join(sorted(dups)[:6])))
        ids[rel] = set(found) | set(re.findall(r'\bname="([^"]+)"', src))
    rep.add("duplicate-html-ids", "fail", not dup_rows,
            "%d document(s) with a repeated id" % len(dup_rows), dup_rows)

    missing_files, missing_anchors = [], []
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        base = os.path.dirname(rel)
        for ref in sorted(set(re.findall(r'(?:href|src)="([^"]+)"', src))):
            if ref.startswith(("#", "http", "mailto:", "tel:", "javascript:", "data:")):
                continue
            target = urllib.parse.unquote(ref.split("#")[0].split("?")[0])
            if not target:
                continue
            joined = os.path.normpath(os.path.join(ROOT, base, target))
            if not os.path.exists(joined):
                missing_files.append("%s -> %s" % (rel, ref))
        for target, frag in re.findall(r'href="([^"#]*)#([^"]+)"', src):
            if target.startswith(("http", "mailto")):
                continue
            key = (os.path.normpath(os.path.join(base, urllib.parse.unquote(target)))
                   .replace(os.sep, "/") if target else rel)
            if key in ids and frag not in ids[key]:
                missing_anchors.append("%s -> %s#%s" % (rel, target, frag))
    rep.add("missing-files", "fail", not missing_files,
            "%d unresolved href/src" % len(missing_files), missing_files)
    rep.add("missing-anchors", "fail", not missing_anchors,
            "%d unresolved fragment" % len(missing_anchors), missing_anchors)
    return ids


# -------------------------------------------------------------- manifest checks
def check_registry(rep: Report, man: dict, pages: list[str]):
    reg = man["pages"]
    paths = [p["path"] for p in reg.values()]

    missing = ["%s -> %s" % (pid, p["path"]) for pid, p in reg.items()
               if not os.path.exists(os.path.join(ROOT, p["path"]))]
    rep.add("registry-to-disk", "fail", not missing,
            "%d registered path(s) not on disk" % len(missing), missing)

    unregistered = sorted(set(pages) - set(paths))
    rep.add("disk-to-registry", "fail", not unregistered,
            "%d page(s) with no manifest entry" % len(unregistered), unregistered)

    dup_paths = ["%s used by %d ids" % (p, c) for p, c in collections.Counter(paths).items() if c > 1]
    rep.add("path-uniqueness", "fail", not dup_paths, "%d shared path(s)" % len(dup_paths), dup_paths)

    rules = man["schemaRules"]
    bad_type = ["%s: %s" % (pid, p.get("type")) for pid, p in reg.items()
                if p.get("type") not in rules["pageTypes"]]
    bad_role = ["%s: %s" % (pid, p.get("contentRole")) for pid, p in reg.items()
                if p.get("contentRole") and p["contentRole"] not in rules["contentRoles"]]
    rep.add("page-type-vocabulary", "fail", not bad_type and not bad_role,
            "%d bad type, %d bad contentRole" % (len(bad_type), len(bad_role)), bad_type + bad_role)


def check_routes(rep: Report, man: dict, ids: dict[str, set]):
    reg, rules = man["pages"], man["schemaRules"]
    allowed = set(rules["allowedStepKeys"])
    forbidden = set(rules["forbiddenStepKeys"])

    purity, key_errs, integrity, finish_errs, section_errs = [], [], [], [], []
    draft_sections = []

    for rid, route in man["routes"].items():
        for banned in ("next", "prev", "nextByRoute"):
            if banned in route:
                purity.append("route %s has %r" % (rid, banned))
        seen = set()
        for pos, step in enumerate(route["steps"], 1):
            where = "route %s step %d" % (rid, pos)
            for key in step:
                if key in forbidden:
                    purity.append("%s has forbidden key %r" % (where, key))
                elif key not in allowed:
                    key_errs.append("%s has unknown key %r" % (where, key))
            if "page" not in step:
                key_errs.append("%s is missing the mandatory `page` key" % where)
                continue
            if step.get("mode") and step["mode"] not in rules["allowedModes"]:
                key_errs.append("%s has mode %r" % (where, step["mode"]))
            pid = step["page"]
            if pid not in reg:
                integrity.append("%s -> unknown page %r" % (where, pid))
                continue
            if pid in seen:
                integrity.append("%s repeats page %r" % (where, pid))
            seen.add(pid)
            if route["status"] == "active" and reg[pid]["type"] in INELIGIBLE_FOR_PUBLIC_ROUTE:
                integrity.append("%s is a %s page in an active route" % (where, reg[pid]["type"]))
            for section in step.get("sections", []):
                page_rel = reg[pid]["path"]
                if section not in ids.get(page_rel, set()):
                    msg = "%s -> section #%s absent from %s" % (where, section, page_rel)
                    (section_errs if route["status"] == "active" else draft_sections).append(msg)
            if route["status"] != "active" and "sections" in step:
                draft_sections.append("%s carries a `sections` key; Stage 2a forbids it" % where)

        for field in ("preflight", "controlPages"):
            for pid in route.get(field, []):
                if pid not in reg:
                    integrity.append("route %s %s -> unknown page %r" % (rid, field, pid))

        finish = route.get("finish")
        if not finish or "page" not in finish:
            finish_errs.append("route %s has no finish.page" % rid)
        else:
            fid = finish["page"]
            if fid not in reg:
                finish_errs.append("route %s finish -> unknown page %r" % (rid, fid))
            elif reg[fid]["type"] in INELIGIBLE_FOR_PUBLIC_ROUTE:
                finish_errs.append("route %s finish -> %s page %r" % (rid, reg[fid]["type"], fid))
            elif finish.get("anchor"):
                rel = reg[fid]["path"]
                if finish["anchor"] not in ids.get(rel, set()):
                    finish_errs.append("route %s finish anchor #%s absent from %s"
                                       % (rid, finish["anchor"], rel))

    rep.add("ordering-purity", "fail", not purity,
            "no next/prev/nextByRoute or duration keys in routes", purity)
    rep.add("step-key-allowlist", "fail", not key_errs,
            "steps use only %s, `page` mandatory" % ", ".join(sorted(allowed)), key_errs)
    rep.add("route-integrity", "fail", not integrity,
            "%d problem(s)" % len(integrity), integrity)
    rep.add("route-finish", "fail", not finish_errs,
            "every route resolves completion through a registered page", finish_errs)
    rep.add("sections-exist-active", "fail", not section_errs,
            "active-route sections must exist on the destination page", section_errs)
    rep.add("draft-routes-have-no-sections", "fail", not draft_sections,
            "Stage 2a forbids section selections in draft routes", draft_sections)

    # Release 2 activated Full alone; Release 3 activates all three. The exact
    # set is asserted by check_route_shape -- this one only pins the count.
    active = sorted(rid for rid, r in man["routes"].items() if r["status"] == "active")
    want = 3 if STAGES.index(rep.stage) >= STAGES.index("3") else 1
    rep.add("active-route-count", "fail", len(active) == want,
            "%d active route(s), expected %d: %s" % (len(active), want, ", ".join(active) or "none"))


def check_draft_isolation(rep: Report, man: dict, pages: list[str]):
    drafts = [rid for rid, r in man["routes"].items() if r["status"] != "active"]
    leaks = []
    haystack = [("assets/sitenav.js", read(os.path.join(ROOT, "assets", "sitenav.js")))]
    for rel in pages:
        haystack.append((rel, read(os.path.join(ROOT, rel))))
    for rid in drafts:
        needle = "route=" + rid
        for rel, src in haystack:
            if needle in src:
                leaks.append("%s references %s" % (rel, needle))
    rep.add("draft-route-isolation", "fail", not leaks,
            "draft routes (%s) are unlinked and unresolvable" % ", ".join(drafts), leaks)


def check_collections(rep: Report, man: dict):
    reg = man["pages"]
    problems, owner, aggregate_notes = [], {}, []
    for cid, col in man["collections"].items():
        for banned in ("next", "prev", "nextByRoute"):
            if banned in col:
                problems.append("collection %s has %r" % (cid, banned))
        if col.get("index") and col["index"] not in reg:
            problems.append("collection %s index -> unknown page %r" % (cid, col["index"]))
        for pid in col["members"]:
            if pid not in reg:
                problems.append("collection %s -> unknown member %r" % (cid, pid))
                continue
            if pid in owner:
                problems.append("page %r is an ordered member of both %s and %s"
                                % (pid, owner[pid], cid))
            owner[pid] = cid
        for pid in col.get("appendix", []):
            if pid not in reg:
                problems.append("collection %s appendix -> unknown page %r" % (cid, pid))

        dur = col.get("durations")
        if dur:
            if not isinstance(dur.get("includeIndex"), bool):
                problems.append("collection %s durations.includeIndex must be a boolean" % cid)
            member_ids = list(col["members"]) + ([col["index"]] if dur.get("includeIndex") else [])
            vals = [reg[m].get("durations", {}).get("full") for m in member_ids if m in reg]
            if all(v is not None for v in vals) and vals:
                total = [sum(v[0] for v in vals), sum(v[1] for v in vals)]
                if total != dur["full"]:
                    problems.append("collection %s: member sum %s != aggregate %s; reconcile "
                                    "before removing the aggregate" % (cid, total, dur["full"]))
            else:
                aggregate_notes.append("%s: published aggregate in use (%d/%d members estimated)"
                                       % (cid, sum(1 for v in vals if v is not None), len(vals)))

    rep.add("collection-integrity", "fail", not problems, "%d problem(s)" % len(problems), problems)

    free = sorted(pid for pid, p in reg.items()
                  if pid not in owner
                  and pid not in {a for c in man["collections"].values() for a in c.get("appendix", [])}
                  and p["type"] not in ("index", "migration", "private"))
    rep.add("collection-free-pages", "report", True,
            "%d page(s) legitimately in no ordered collection" % len(free), free)
    rep.add("collection-aggregates", "report", True,
            "%d collection(s) using a published aggregate" % len(aggregate_notes), aggregate_notes)


def check_retired_links(rep: Report, man: dict, pages: list[str]):
    reg = man["pages"]
    migration_paths = {p["path"] for p in reg.values() if p["type"] == "migration"}
    leaks = []
    for rel in pages:
        if rel in migration_paths:
            continue
        src = read(os.path.join(ROOT, rel))
        base = os.path.dirname(rel)
        for ref in set(re.findall(r'href="([^"]+)"', src)):
            if ref.startswith(("#", "http", "mailto:")):
                continue
            target = os.path.normpath(os.path.join(base, ref.split("#")[0].split("?")[0])) \
                .replace(os.sep, "/")
            if target in migration_paths:
                leaks.append("%s -> %s" % (rel, ref))
    rep.add("no-links-to-retired-pages", "fail", not leaks, "%d live link(s)" % len(leaks), leaks)


# ---------------------------------------------------------------------- metrics
def collection_of(man: dict) -> dict[str, str]:
    out = {}
    for cid, col in man["collections"].items():
        for pid in col["members"]:
            out[pid] = cid
        if col.get("index"):
            out.setdefault(col["index"], cid)
    return out


def compute_metric(man: dict, name_or_spec, memo: dict, trail=()) -> tuple[list | None, list[str]]:
    """Return ([min,max] minutes, errors)."""
    errors: list[str] = []
    if isinstance(name_or_spec, str):
        if name_or_spec in memo:
            return memo[name_or_spec], []
        if name_or_spec in trail:
            return None, ["metric cycle: %s" % " -> ".join(trail + (name_or_spec,))]
        spec = man["metrics"].get(name_or_spec)
        if spec is None:
            return None, ["unknown metric %r" % name_or_spec]
        value, errs = compute_metric(man, spec, memo, trail + (name_or_spec,))
        memo[name_or_spec] = value
        return value, errs

    spec = name_or_spec
    if "sum" in spec:
        total = [0, 0]
        for part in spec["sum"]:
            value, errs = compute_metric(man, part, memo, trail)
            errors += errs
            if value is None:
                return None, errors
            total = [total[0] + value[0], total[1] + value[1]]
        return total, errors

    source = spec["source"]
    reg = man["pages"]
    if "collectionAggregate" in source:
        col = man["collections"].get(source["collectionAggregate"])
        if not col or not col.get("durations"):
            return None, errors + ["no aggregate on collection %r" % source["collectionAggregate"]]
        return list(col["durations"][source.get("mode", "full")]), errors

    if "route" in source:
        route = man["routes"].get(source["route"])
        if not route:
            return None, errors + ["unknown route %r" % source["route"]]
        owner = collection_of(man)
        include = set(source.get("includeTags") or [])
        exclude = set(source.get("excludeCollections") or [])
        total = [0, 0]
        for step in route["steps"]:
            pid = step["page"]
            page = reg.get(pid, {})
            if include and not (include & set(page.get("tags") or [])):
                continue
            if owner.get(pid) in exclude:
                continue
            dur = (page.get("durations") or {}).get(step.get("mode", "full") if
                                                   step.get("mode") == "core" else "full")
            if dur is None:
                errors.append("page %r has no %s duration but a metric needs it"
                              % (pid, step.get("mode", "full")))
                continue
            total = [total[0] + dur[0], total[1] + dur[1]]
        return total, errors

    if "page" in source:
        page = reg.get(source["page"])
        if page is None:
            return None, errors + ["unknown page %r" % source["page"]]
        dur = (page.get("durations") or {}).get(source.get("mode", "full"))
        if dur is None:
            return None, errors + ["page %r has no %s duration"
                                   % (source["page"], source.get("mode", "full"))]
        return list(dur), errors

    return None, errors + ["unrecognised metric source: %s" % json.dumps(source)]


def check_metrics(rep: Report, man: dict):
    memo, rows, errors, mismatches = {}, [], [], []
    for name in man["metrics"]:
        value, errs = compute_metric(man, name, memo)
        errors += ["%s: %s" % (name, e) for e in errs]
        expect = man["metrics"][name].get("expect")
        ok = value is not None and (expect is None or value == expect)
        if not ok:
            mismatches.append("%s computed %s expected %s" % (name, value, expect))
        rows.append({"metric": name, "computed": value, "expect": expect, "ok": ok})
    rep.add("metric-durations-available", "fail", not errors,
            "no metric depends on a null duration", errors)
    rep.add("metrics-match-expected", sev(rep, "2e"), not mismatches,
            "%d of %d metric(s) agree with their published value"
            % (len(rows) - len(mismatches), len(rows)), mismatches)
    return rows


def claim_divisor(man: dict, metric: str) -> int:
    """Published copy is written in hours, except where the metric says minutes."""
    return 1 if (man["metrics"].get(metric) or {}).get("unit") == "minutes" else 60


def marker_attr(man: dict, metric: str) -> str:
    return ("data-metric-minutes" if (man["metrics"].get(metric) or {}).get("unit") == "minutes"
            else "data-metric-hours")


def check_metric_claims(rep: Report, man: dict, memo_rows):
    cfg_path = os.path.join(ROOT, "tools", "metrics.config.json")
    cfg = json.loads(read(cfg_path))
    by_name = {r["metric"]: r for r in memo_rows}
    problems = []

    for claim in cfg["claims"]:
        rel = claim["file"]
        src = read(os.path.join(ROOT, rel))
        if claim["text"] not in src:
            problems.append("%s: text %r not found in %s" % (claim["id"], claim["text"], rel))
            continue
        row = by_name.get(claim["metric"])
        if row is None:
            problems.append("%s: unknown metric %r" % (claim["id"], claim["metric"]))
            continue
        nums = [int(n) for n in re.findall(r"\d+", claim["text"])]
        div = claim_divisor(man, claim["metric"])
        if row["computed"] and len(nums) >= 2:
            shown = [row["computed"][0] // div, row["computed"][1] // div]
            if shown != nums[:2]:
                problems.append("%s: page says %s, metric computes %s"
                                % (claim["id"], nums[:2], shown))

    counts = count_sources(man)
    for claim in cfg["counts"]:
        rel = claim["file"]
        src = read(os.path.join(ROOT, rel))
        if claim["text"] not in src:
            problems.append("%s: text %r not found in %s" % (claim["id"], claim["text"], rel))
            continue
        src_key = claim["source"]
        if src_key.startswith("literal:"):
            continue
        actual = counts.get(src_key)
        if actual is None:
            problems.append("%s: unsupported count source %r" % (claim["id"], src_key))
            continue
        nums = [int(n) for n in re.findall(r"\d+", claim["text"])]
        if nums and nums[0] != actual:
            problems.append("%s: page says %d, computed %d" % (claim["id"], nums[0], actual))

    rep.add("registered-metric-claims", sev(rep, cfg["enforcedFromStage"]), not problems,
            "%d claim(s) + %d count(s) registered" % (len(cfg["claims"]), len(cfg["counts"])),
            problems)


def count_sources(man: dict) -> dict[str, int]:
    out = {}
    for cid, col in man["collections"].items():
        out["collectionSize:" + cid] = len(col["members"])
    total = 0
    for rel in sorted(os.listdir(os.path.join(ROOT, "interview-prep"))):
        if rel.endswith(".html") and rel != "index.html":
            total += len(re.findall(r'<details class="prep-question"',
                                    read(os.path.join(ROOT, "interview-prep", rel))))
    out["markup:prep-question,scope=interview-prep"] = total
    for rel in sorted(os.listdir(os.path.join(ROOT, "interview-prep"))):
        if rel.endswith(".html") and rel != "index.html":
            out["markup:prep-question,file=interview-prep/" + rel] = len(re.findall(
                r'<details class="prep-question"',
                read(os.path.join(ROOT, "interview-prep", rel))))
    pids = set()
    dsa_dir = os.path.join(ROOT, "dsa-prep")
    for rel in sorted(os.listdir(dsa_dir)):
        if rel.endswith(".html"):
            pids |= set(re.findall(r'<details class="dsa-prob" id="[^"]*" data-pid="([^"]+)"',
                                   read(os.path.join(dsa_dir, rel))))
    out["markup:dsa-distinct-pids"] = len(pids)
    for rid, route in man["routes"].items():
        out["route-size:" + rid] = len(route["steps"])
    return out


def check_metric_markers(rep: Report, man: dict, pages: list[str]):
    """Stage 2e: every registered claim is marked exactly once and agrees.

    Hour markers carry a metric name -- two claims may share one metric so long
    as they live in different files -- and count markers carry the claim id,
    which is unique by construction.
    """
    cfg = json.loads(read(os.path.join(ROOT, "tools", "metrics.config.json")))
    counts = count_sources(man)
    memo: dict = {}
    problems, checked = [], 0

    # Several claims may share one metric -- python-rail-hours is stated three
    # times on the study plan -- so a claim is bound to the marked element
    # nearest its `near` anchor, and each element may be claimed only once.
    bound: dict = {}
    for claim in cfg["claims"]:
        path = claim["file"]
        src = read(os.path.join(ROOT, path))
        pat = r'<[^>]*%s="%s"[^>]*>([^<]*)' % (marker_attr(man, claim["metric"]),
                                              re.escape(claim["metric"]))
        found = [(m.start(), m.group(1)) for m in re.finditer(pat, src)]
        if not found:
            problems.append("%s: no element carries %s=%r in %s"
                            % (claim["id"], marker_attr(man, claim["metric"]),
                               claim["metric"], path))
            continue
        if len(found) == 1:
            pos, text = found[0]
        else:
            near = claim.get("near")
            if not near:
                problems.append("%s: %d elements share metric %r and the claim has no `near`"
                                % (claim["id"], len(found), claim["metric"]))
                continue
            anchor = src.find(near)
            if anchor == -1:
                problems.append("%s: anchor %r not found in %s" % (claim["id"], near, path))
                continue
            pos, text = min(found, key=lambda ft: abs(ft[0] - anchor))
        key = (path, pos)
        if key in bound:
            problems.append("%s and %s bind to the same element in %s"
                            % (bound[key], claim["id"], path))
            continue
        bound[key] = claim["id"]
        checked += 1
        if claim["text"] not in text and text.strip() not in claim["text"]:
            problems.append("%s: marked text %r does not carry the claim %r"
                            % (claim["id"], text[:60], claim["text"]))
        value, errs = compute_metric(man, claim["metric"], memo)
        if errs or value is None:
            problems.append("%s: %s" % (claim["id"], "; ".join(errs) or "no value"))
            continue
        div = claim_divisor(man, claim["metric"])
        shown = [int(n) for n in re.findall(r"\d+", claim["text"])][:2]
        want = [value[0] // div, value[1] // div]
        if shown != want:
            problems.append("%s: page says %s, metric computes %s"
                            % (claim["id"], shown, want))

    for claim in cfg["counts"]:
        src = read(os.path.join(ROOT, claim["file"]))
        pat = r'<[^>]*data-metric-count="%s"[^>]*>([^<]*)' % re.escape(claim["id"])
        hits = re.findall(pat, src)
        if len(hits) != 1:
            problems.append("%s: %d element(s) carry data-metric-count=%r"
                            % (claim["id"], len(hits), claim["id"]))
            continue
        checked += 1
        if claim["text"] not in hits[0]:
            problems.append("%s: marked text %r != claim %r"
                            % (claim["id"], hits[0][:60], claim["text"]))
        source = claim["source"]
        if source.startswith("literal:"):
            continue
        actual = counts.get(source)
        if actual is None:
            problems.append("%s: unsupported count source %r" % (claim["id"], source))
            continue
        shown = [int(n) for n in re.findall(r"\d+", claim["text"])]
        if not shown or shown[0] != actual:
            problems.append("%s: page says %s, computed %d" % (claim["id"], shown[:1], actual))

    registered_h = {c["metric"] for c in cfg["claims"]}
    registered_c = {c["id"] for c in cfg["counts"]}
    total = 0
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        for v in re.findall(r'data-metric-hours="([^"]*)"', src):
            total += 1
            if v not in registered_h:
                problems.append("%s: unregistered hour marker %r" % (rel, v))
        for v in re.findall(r'data-metric-minutes="([^"]*)"', src):
            total += 1
            if v not in registered_h:
                problems.append("%s: unregistered minute marker %r" % (rel, v))
        for v in re.findall(r'data-metric-count="([^"]*)"', src):
            total += 1
            if v not in registered_c:
                problems.append("%s: unregistered count marker %r" % (rel, v))
    expected = len(cfg["claims"]) + len(cfg["counts"])
    if total != expected:
        problems.append("%d markers on disk, %d registered claims" % (total, expected))

    rep.add("metric-markers", sev(rep, "2e"), not problems,
            "%d/%d registered claim(s) marked and reconciled" % (checked, expected), problems)


def check_metric_runtime(rep: Report, pages: list[str]):
    """The verifier must detect, never repair, and load only where it is needed."""
    path = os.path.join(ROOT, "assets", "metric-checks.js")
    if not os.path.exists(path):
        rep.add("metric-runtime", sev(rep, "2e"), False, "assets/metric-checks.js is missing")
        return
    problems = []
    src = strip_js_comments(read(path))
    if "innerHTML" in src:
        problems.append("uses innerHTML")
    if re.search(r"\.textContent\s*=", src):
        problems.append("assigns textContent")
    for banned in ("replaceChildren", "insertAdjacentHTML", "removeChild", "appendChild"):
        if banned in src:
            problems.append("uses %s" % banned)
    if re.search(r'querySelectorAll\(\s*.\[data-(?:hours|count)\]', src):
        problems.append("selects a generic data-hours/data-count element")
    if "data-metric-hours" not in src:
        problems.append("does not select [data-metric-hours]")
    if "data-metric-minutes" not in src:
        problems.append("does not select [data-metric-minutes]")
    if "console.error" not in src:
        problems.append("does not report mismatches with console.error")

    with_marker = {rel for rel in pages
                   if re.search(r"data-metric-(?:hours|minutes)", read(os.path.join(ROOT, rel)))}
    loading = set()
    for rel in pages:
        html = read(os.path.join(ROOT, rel))
        m = re.search(r'<script[^>]+src="([^"]*metric-checks\.js[^"]*)"', html)
        if not m:
            continue
        loading.add(rel)
        cur = re.search(r'<script[^>]+src="[^"]*curriculum\.js', html)
        if not cur or cur.start() > m.start():
            problems.append("%s loads metric-checks.js before the manifest" % rel)
        query = m.group(1).split("metric-checks.js")[1]
        if not re.match(r"^\?v=[\w.-]+$", query):
            problems.append("%s: metric-checks.js reference is unversioned" % rel)
    if loading != with_marker:
        problems.append("loaded on %s but hour markers are on %s"
                        % (sorted(loading), sorted(with_marker)))
    rep.add("metric-runtime", sev(rep, "2e"), not problems,
            "detector-only; loaded on %d page(s) carrying hour markers" % len(loading), problems)


def check_metric_tests(rep: Report, skip: bool):
    if skip:
        rep.add("metric-tests", "skip", True, "--skip-tests")
        return
    path = os.path.join(ROOT, "tools", "test-metrics.js")
    if not os.path.exists(path):
        rep.add("metric-tests", sev(rep, "2e"), False, "tools/test-metrics.js is missing")
        return
    proc = subprocess.run(["node", path], capture_output=True, text=True, encoding="utf-8")
    tail = [ln for ln in (proc.stdout or "").splitlines() if "assertion" in ln]
    rep.add("metric-tests", sev(rep, "2e"), proc.returncode == 0,
            tail[-1] if tail else "no summary line",
            [] if proc.returncode == 0
            else [ln for ln in (proc.stdout or "").splitlines()
                  if ln.strip().startswith("FAIL")][:20])


# -------------------------------------------------- later-stage contract checks
def check_route_shape(rep: Report, man: dict):
    """The activated routes are exactly what was approved.

    Release 2 activated Full alone with genai-g0 first. Release 3 puts
    Foundations first, keeps steps 03-69 byte-identical to the recorded Release 2
    order, and promotes the two draft routes.
    """
    r3 = STAGES.index(rep.stage) >= STAGES.index("3")
    r31 = STAGES.index(rep.stage) >= STAGES.index("3.1")
    problems = []
    routes = man["routes"]
    full = routes.get("full")
    if not full:
        rep.add("route-shape", sev(rep, "2f"), False, "no Full route")
        return

    if len(full["steps"]) != 69:
        problems.append("Full has %d steps, expected 69" % len(full["steps"]))
    order = [s2["page"] for s2 in full["steps"]]
    want_open = ["llm-foundations", "genai-g0"] if r3 else ["genai-g0", "llm-foundations"]
    if order[:2] != want_open:
        problems.append("Full opens %s, expected %s" % (order[:2], want_open))
    if full.get("preflight") != ["beginner-basics"]:
        problems.append("Full preflight is %r" % (full.get("preflight"),))
    if full.get("controlPages") != ["study-plan"]:
        problems.append("Full controlPages is %r" % (full.get("controlPages"),))
    if "beginner-basics" in order:
        problems.append("the Full preflight page is also a numbered step")

    if r3:
        fixture = os.path.join(ROOT, "tools", "baselines", "full-route-r2.json")
        if not os.path.exists(fixture):
            problems.append("tools/baselines/full-route-r2.json is missing")
        else:
            r2 = json.loads(read(fixture))["steps"]
            if order[2:] != r2[2:]:
                for i, (a, b) in enumerate(zip(order[2:], r2[2:]), start=3):
                    if a != b:
                        problems.append("Full step %02d is %r, Release 2 had %r" % (i, a, b))
                        break
            if sorted(order) != sorted(r2):
                problems.append("Full membership changed since Release 2")

    expected_active = ["full", "interview-sprint", "job-ready"] if r3 else ["full"]
    active = sorted(rid for rid, v in routes.items() if v["status"] == "active")
    if active != expected_active:
        problems.append("active routes %s, expected %s" % (active, expected_active))

    for rid in active:
        route = routes[rid]
        steps = [s2["page"] for s2 in route["steps"]]
        if (route.get("finish") or {}).get("page") != "study-plan":
            problems.append("%s finish.page is %r" % (rid, (route.get("finish") or {}).get("page")))
        dupes = [p for p in set(steps) if steps.count(p) > 1]
        if dupes:
            problems.append("%s repeats %s" % (rid, sorted(dupes)))
        if any("sections" in s2 for s2 in route["steps"]):
            problems.append("%s contains section assignments" % rid)
        missing = [p for p in steps if p not in man["pages"]]
        if missing:
            problems.append("%s references unregistered pages %s" % (rid, missing[:4]))
        gone = [p for p in steps
                if p in man["pages"] and not os.path.exists(
                    os.path.join(ROOT, man["pages"][p]["path"]))]
        if gone:
            problems.append("%s references missing files %s" % (rid, gone[:4]))
        if r3 and rid != "full" and steps and steps[0] != "beginner-basics":
            problems.append("%s starts with %r, expected beginner-basics" % (rid, steps[0]))
        want_size = {"full": 69, "interview-sprint": 28,
                     "job-ready": 27 if r31 else 26}.get(rid)
        if r3 and want_size is not None and len(steps) != want_size:
            problems.append("%s has %d steps, expected %d" % (rid, len(steps), want_size))

    detail = " | ".join("%s: %d steps" % (rid, len(routes[rid]["steps"])) for rid in active)
    rep.add("route-shape", sev(rep, "2f"), not problems,
            "%s; all finish at study-plan" % detail, problems)


def check_route_entries(rep: Report, man: dict, pages: list[str]):
    """Every authored route-entry link points at that route's actual first step."""
    problems, found = [], []
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        for m in re.finditer(r'<a[^>]*data-route-entry="([^"]+)"[^>]*>', src):
            tag = m.group(0)
            rid = m.group(1)
            href = re.search(r'href="([^"]+)"', tag)
            found.append((rel, rid))
            if rid not in man["routes"]:
                problems.append("%s: unknown route %r" % (rel, rid)); continue
            route = man["routes"][rid]
            if route["status"] != "active":
                problems.append("%s: entry for a %s route %r" % (rel, route["status"], rid)); continue
            if not href:
                problems.append("%s: route entry for %r has no href" % (rel, rid)); continue
            want = "%s?route=%s" % (man["pages"][route["steps"][0]["page"]]["path"], rid)
            if href.group(1) != want:
                problems.append("%s: %r points at %r, first step is %r"
                                % (rel, rid, href.group(1), want))
    active = [rid for rid, r in man["routes"].items() if r["status"] == "active"]
    if STAGES.index(rep.stage) >= STAGES.index("3"):
        for page in ("index.html", "study-plan.html"):
            for rid in active:
                if (page, rid) not in found:
                    problems.append("%s has no route entry for %r" % (page, rid))
    rep.add("route-entries", sev(rep, "3"), not problems,
            "%d authored route entry link(s) across %d page(s)"
            % (len(found), len({f[0] for f in found})), problems)


def check_sidebar_untouched(rep: Report):
    """Release 3 must not touch sidebar labels, grouping or ordering."""
    src = read(os.path.join(ROOT, "assets", "sitenav.js"))
    groups = re.findall(r'id:\s*"([^"]+)",\s*\n?\s*label:\s*"([^"]+)"', src)
    expected = [("studyplan", "Study Plan"), ("mastery", "GenAI Mastery"),
                ("agents", "Understanding AI Agents"), ("deepdives", "Deep Dives"),
                ("interviewquestions", "Interview Questions"),
                ("scenariopractice", "Scenario Design Studio"),
                ("dsa", "DSA Interview Preparation"), ("jobsearch", "Job Search & Remote Work")]
    problems = []
    if groups != expected:
        problems.append("sidebar groups/order changed: %s" % groups)
    if "route=" in src:
        problems.append("sitenav.js now emits route parameters")
    rep.add("sidebar-untouched", sev(rep, "3"), not problems,
            "%d sidebar group(s), labels and order unchanged" % len(groups), problems)


def check_authored_route_params(rep: Report, man: dict, pages: list[str]):
    """Only the approved entry links may carry route context in the source.

    Everything else is generated at runtime; a route parameter baked into an
    authored href would survive with JavaScript off and pin a learner to a route
    they never chose.
    """
    allowed = {("study-plan.html", "modules/00_basics.html?route=full")}
    # Every authored route entry is allowed, and is separately checked against
    # the manifest by check_route_entries.
    for rel in pages:
        src_a = read(os.path.join(ROOT, rel))
        for m in re.finditer(r'<a[^>]*data-route-entry="[^"]+"[^>]*>', src_a):
            href = re.search(r'href="([^"]+)"', m.group(0))
            if href:
                allowed.add((rel, href.group(1)))
    problems, found = [], 0
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        for href in re.findall(r'href="([^"]*)"', src):
            if "route=" not in href and "resume=" not in href:
                continue
            found += 1
            if (rel, href) not in allowed:
                problems.append("%s -> %s" % (rel, href))
    for a in sorted(allowed):
        if a[1] not in read(os.path.join(ROOT, a[0])):
            problems.append("approved entry link missing: %s -> %s" % a)
    rep.add("authored-route-params", sev(rep, "2f"), not problems,
            "%d authored link(s) carry route context, all approved" % found, problems)


# -------------------------------------------------- later-stage contract checks
def check_identity(rep: Report, man: dict, pages: list[str]):
    reg = man["pages"]
    by_path = {p["path"]: pid for pid, p in reg.items()}
    declared, mismatched, dup = {}, [], []
    for rel in pages:
        found = re.search(r'<body[^>]*\bdata-curriculum-id="([^"]+)"', read(os.path.join(ROOT, rel)))
        if not found:
            continue
        pid = found.group(1)
        if pid in declared:
            dup.append("%s and %s both declare %r" % (declared[pid], rel, pid))
        declared[pid] = rel
        if pid not in reg:
            mismatched.append("%s declares unregistered id %r" % (rel, pid))
        elif reg[pid]["path"] != rel:
            mismatched.append("%s declares %r whose registered path is %s"
                              % (rel, pid, reg[pid]["path"]))
    missing = sorted(set(by_path.values()) - set(declared))
    ok = not mismatched and not dup and not missing
    rep.add("page-identity", sev(rep, "2b"), ok,
            "%d/%d page(s) declare data-curriculum-id" % (len(declared), len(pages)),
            (mismatched + dup + ["not yet declared: %d page(s)" % len(missing)]) if not ok else [])


def check_fallbacks(rep: Report, man: dict):
    """Static fallback is required for route/collection pages and for index pages
    that are in an active route or declare navSlot. Others are exempt."""
    reg = man["pages"]
    active = [r for r in man["routes"].values() if r["status"] == "active"]
    in_route = {s["page"] for r in active for s in r["steps"]}
    owner = collection_of(man)
    problems = []
    for pid, page in reg.items():
        typ = page["type"]
        if typ in ("private", "optional-track"):
            continue
        required = (typ != "index" and (pid in in_route or pid in owner or typ == "migration")) \
            or (typ == "index" and (pid in in_route or page.get("navSlot")))
        src = read(os.path.join(ROOT, page["path"]))
        block = re.search(r'<div class="page-nav"[^>]*>([\s\S]*?)</div>\s*</div>|'
                          r'<div class="page-nav"[^>]*>([\s\S]*?)</div>', src)
        has_links = bool(block and re.search(r"<a\b", block.group(0)))
        if required and not has_links:
            problems.append("%s (%s) needs a static fallback and has none" % (pid, page["path"]))
    rep.add("static-fallback-present", sev(rep, "2b"), not problems,
            "%d page(s) missing a required fallback" % len(problems), problems)


def strip_js_comments(src: str) -> str:
    """Remove JS comments while leaving string literals intact.

    Necessary because the contract checks below search for things like
    `innerHTML` and `replaceChildren(`, and page-nav.js documents its own
    contract in a header comment that names them. Analysing prose as if it were
    code is the same mistake that hid the progress.html truncation, so the
    stripper is character-accurate about quotes rather than regex-based.
    """
    out, i, n = [], 0, len(src)
    quote = None
    while i < n:
        ch = src[i]
        if quote:
            out.append(ch)
            if ch == "\\" and i + 1 < n:
                out.append(src[i + 1])
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch in "\"'`":
            quote = ch
            out.append(ch)
            i += 1
            continue
        if src.startswith("//", i):
            j = src.find("\n", i)
            i = n if j == -1 else j
            continue
        if src.startswith("/*", i):
            j = src.find("*/", i + 2)
            i = n if j == -1 else j + 2
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def check_runtime_contract(rep: Report):
    """The contract points the Release 2 design fixed for assets/page-nav.js."""
    path = os.path.join(ROOT, "assets", "page-nav.js")
    if not os.path.exists(path):
        rep.add("runtime-contract", "skip", True,
                "assets/page-nav.js not present until stage 2c; contract recorded in the design: "
                "document.currentScript captured at initial execution, PORTAL_ROOT_URL derived "
                "once, linkToPage() by page id only, replaceChildren() called exactly once, "
                "textContent for untrusted values, no writes to metric elements")
        return
    src = strip_js_comments(read(path))
    problems = []
    # currentScript must be read at top level, not from a function body.
    first = src.find("document.currentScript")
    if first == -1:
        problems.append("does not capture document.currentScript")
    else:
        preamble = src[:first]
        if preamble.count("function") > 1:
            problems.append("document.currentScript is not read during initial execution")
    if "replaceChildren" not in src:
        problems.append("does not use replaceChildren")
    if len(re.findall(r"\breplaceChildren\(", src)) != 1:
        problems.append("replaceChildren is called from more than one place")
    if "innerHTML" in src:
        problems.append("uses innerHTML")
    if "withRoute" in src:
        problems.append("still contains withRoute; links must be generated by page id")
    if "step.item" in src or '["item"]' in src:
        problems.append("reads step.item; the schema uses step.page")
    if "step.page" not in src and "s.page" not in src:
        problems.append("does not read step.page")
    if "data-curriculum-id" not in src:
        problems.append("does not resolve the page by data-curriculum-id")
    if 'status === "active"' not in src:
        problems.append("does not gate on route status active")
    if re.search(r'querySelector\w*\(\s*["\'][^"\']*data-(?:count|hours|metric)', src):
        problems.append("selects metric elements; the renderer must never touch them")
    if "createDocumentFragment" not in src:
        problems.append("does not build output in a detached fragment")
    rep.add("runtime-contract", sev(rep, "2c"), not problems, "%d issue(s)" % len(problems), problems)


PILOT_NINE = {
    "modules/04_embeddings.html", "teach-agents/lessons/0007-reliability.html",
    "interview-prep/03-agents-mcp.html", "dsa-prep/12-trees-bst.html",
    "teach-agents/index.html", "modules/06_rag_basics.html",
    "modules/00_basics.html", "study-plan.html", "job-search/index.html",
}


def check_pilot_scope(rep: Report, man: dict, pages: list[str]):
    """Stage 2c enables the runtime on nine pages; stage 2d on all of them."""
    site_wide = STAGES.index(rep.stage) >= STAGES.index("2d")
    expected = set(pages) if site_wide else PILOT_NINE
    label = "runtime-coverage" if site_wide else "pilot-scope"
    cur_ref, nav_ref, order_bad = set(), set(), []
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        has_cur = re.search(r'<script[^>]+src="[^"]*curriculum\.js', src)
        has_nav = re.search(r'<script[^>]+src="[^"]*page-nav\.js', src)
        if has_cur:
            cur_ref.add(rel)
        if has_nav:
            nav_ref.add(rel)
        if has_cur and has_nav and has_cur.start() > has_nav.start():
            order_bad.append("%s loads page-nav.js before curriculum.js" % rel)
        if has_nav and not has_cur:
            order_bad.append("%s loads page-nav.js without the manifest" % rel)
        for asset in ("curriculum", "page-nav"):
            refs = re.findall(r'<script[^>]+src="([^"]*%s\.js[^"]*)"' % asset, src)
            if len(refs) > 1:
                order_bad.append("%s references %s.js %d times" % (rel, asset, len(refs)))
            for ref in refs:
                target = os.path.normpath(os.path.join(
                    ROOT, os.path.dirname(rel), ref.split("?")[0]))
                if not os.path.exists(target):
                    order_bad.append("%s: %s does not resolve" % (rel, ref))

    problems = list(order_bad)
    if cur_ref != expected:
        problems.append("curriculum.js references: unexpected %s / missing %s"
                        % (sorted(cur_ref - expected), sorted(expected - cur_ref)))
    if nav_ref != expected:
        problems.append("page-nav.js references: unexpected %s / missing %s"
                        % (sorted(nav_ref - expected), sorted(expected - nav_ref)))
    # every wired page must have both an id and a nav slot for the runtime to work
    for rel in sorted(expected):
        src = read(os.path.join(ROOT, rel))
        if "data-curriculum-id" not in src:
            problems.append("%s has no data-curriculum-id" % rel)
        if "data-page-nav" not in src:
            problems.append("%s has no [data-page-nav] slot" % rel)
    rep.add(label, sev(rep, "2c"), not problems,
            "%d/%d page(s) reference the manifest, %d/%d the renderer"
            % (len(cur_ref), len(expected), len(nav_ref), len(expected))
            if site_wide else
            "%d page(s) wired, %d page(s) untouched by the runtime"
            % (len(nav_ref), len(pages) - len(nav_ref)), problems)

    # One cache-busting version across both runtime assets, everywhere. A mixed
    # version means some browsers would keep an older page-nav.js against a newer
    # manifest, which is the one combination nothing else here can detect.
    versions, unversioned = collections.Counter(), []
    for rel in sorted(cur_ref | nav_ref):
        src = read(os.path.join(ROOT, rel))
        for asset in ("curriculum", "page-nav"):
            for ref in re.findall(r'src="[^"]*%s\.js([^"]*)"' % asset, src):
                m = re.match(r"^\?v=([\w.-]+)$", ref)
                if not m:
                    unversioned.append("%s: %s.js reference has no ?v= (%r)" % (rel, asset, ref))
                else:
                    versions[m.group(1)] += 1
    vprob = list(unversioned)
    if len(versions) > 1:
        vprob.append("mixed versions in use: %s" % dict(versions))
    rep.add("runtime-asset-version", sev(rep, "2c"), not vprob,
            "single version %s across %d reference(s)"
            % (list(versions)[0] if len(versions) == 1 else "?", sum(versions.values())), vprob)


def check_metric_namespace(rep: Report, man: dict, pages: list[str]):
    """Only data-metric-hours / data-metric-count are manifest metrics.

    google-prep/index.html has used a bare data-hours attribute on a <select>
    since before Release 2, so the generic names are unsafe as selectors and are
    explicitly ignored. Values on the reserved names must resolve.
    """
    cfg = json.loads(read(os.path.join(ROOT, "tools", "metrics.config.json")))
    metrics = set(man["metrics"])
    claim_ids = {c["id"] for c in cfg["counts"]}
    bad, reserved_used, legacy = [], 0, []
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        for attr, pool, kind in (("data-metric-hours", metrics, "metric"),
                                 ("data-metric-minutes", metrics, "metric"),
                                 ("data-metric-count", claim_ids, "count claim")):
            for value in re.findall(attr + r'="([^"]*)"', src):
                reserved_used += 1
                if value not in pool:
                    bad.append("%s: %s=%r names no registered %s" % (rel, attr, value, kind))
        # "(?<!-)" so data-metric-hours does not also match as data-hours
        for attr in ("data-hours", "data-count"):
            if re.search(r'(?<!-)\b' + attr + r'=', src):
                legacy.append("%s uses %s (ignored: not a manifest metric)" % (rel, attr))
    if STAGES.index(rep.stage) < STAGES.index("2e") and reserved_used:
        bad.append("%d reserved metric attribute(s) present before Stage 2e" % reserved_used)
    rep.add("metric-namespace", sev(rep, "2c"), not bad,
            "%d reserved attribute(s) in use; %d unrelated legacy attribute(s) ignored"
            % (reserved_used, len(legacy)), bad + legacy)


def check_page_nav_tests(rep: Report, skip: bool):
    if skip:
        rep.add("page-nav-state-tests", "skip", True, "--skip-tests")
        return
    path = os.path.join(ROOT, "tools", "test-page-nav.js")
    if not os.path.exists(path):
        rep.add("page-nav-state-tests", sev(rep, "2c"), False, "tools/test-page-nav.js is missing")
        return
    proc = subprocess.run(["node", path], capture_output=True, text=True, encoding="utf-8")
    tail = [ln for ln in (proc.stdout or "").splitlines() if "assertion" in ln]
    rep.add("page-nav-state-tests", sev(rep, "2c"), proc.returncode == 0,
            tail[-1] if tail else "no summary line",
            [] if proc.returncode == 0
            else [ln for ln in (proc.stdout or "").splitlines() if ln.strip().startswith("FAIL")][:20])


# --------------------------------------------------------------- syntax + tests
def check_js(rep: Report):
    def js_in(*parts):
        d = os.path.join(ROOT, *parts)
        if not os.path.isdir(d):
            return []
        return [os.path.join(*parts, f) for f in os.listdir(d) if f.endswith(".js")]

    targets = sorted(js_in("assets") +
                     js_in("machine-learning", "assets") +
                     [os.path.join("tools", f) for f in os.listdir(os.path.join(ROOT, "tools"))
                      if f.endswith(".js")])
    bad = []
    for rel in targets:
        proc = subprocess.run(["node", "--check", os.path.join(ROOT, rel)],
                              capture_output=True, text=True)
        if proc.returncode != 0:
            bad.append("%s: %s" % (rel, (proc.stderr or "").strip().splitlines()[:1]))
    rep.add("javascript-syntax", "fail", not bad,
            "%d file(s) checked" % len(targets), bad)


def check_python_snippets(rep: Report, pages: list[str]):
    total, invalid = 0, collections.Counter()
    detail = []
    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        for match in re.finditer(r"<pre[^>]*>([\s\S]*?)</pre>", src):
            # Strip real tags only. A bare `<` in code (`if not 1 <= n <= 10`)
            # must survive: requiring a name character after `<` or `</` keeps
            # comparison operators out of the tag pattern.
            code = htmlmod.unescape(
                re.sub(r"</?[A-Za-z][^>]*>", "", match.group(1))).strip()
            if not code or not re.search(r"^(import |from |def |class |async def )", code, re.M):
                continue
            total += 1
            try:
                compile(code, "<snippet>", "exec")
            except SyntaxError as err:
                invalid[rel] += 1
                detail.append("%s line %d: %s" % (rel, src[:match.start()].count("\n") + 1, err.msg))
            except Exception:
                pass
    unexpected = []
    for rel, count in invalid.items():
        allowed = PY_EXCERPT_ALLOWLIST.get(rel)
        if not allowed:
            unexpected.append("%s has %d unlabelled invalid block(s)" % (rel, count))
        elif count != allowed["count"]:
            unexpected.append("%s has %d invalid block(s), allowlist permits %d"
                              % (rel, count, allowed["count"]))
    rep.add("python-snippet-syntax", "fail", not unexpected,
            "%d block(s) scanned, %d intentional excerpt(s) allowlisted"
            % (total, sum(v["count"] for v in PY_EXCERPT_ALLOWLIST.values())),
            unexpected + detail)


def check_tests(rep: Report, skip: bool):
    if skip:
        rep.add("project-tests", "skip", True, "--skip-tests")
        return
    results, bad = [], []
    for rel, expect in (("teach-agents/project", 190), ("teach-agents/eda-lab", 87)):
        proc = subprocess.run([sys.executable, "-m", "pytest", "-q"],
                              cwd=os.path.join(ROOT, rel), capture_output=True, text=True)
        tail = (proc.stdout or "").strip().splitlines()[-1:] or [""]
        passed = re.search(r"(\d+) passed", tail[0])
        count = int(passed.group(1)) if passed else -1
        results.append("%s: %s" % (rel, tail[0]))
        if proc.returncode != 0 or count != expect:
            bad.append("%s expected %d passed, got %r" % (rel, expect, tail[0]))
    rep.add("project-tests", "fail", not bad, " | ".join(results), bad)


def check_document_structure(rep: Report, pages: list[str]):
    """Exactly one html/head/body opening tag and at least one stylesheet.

    Added after a Release 1 rewrite of progress.html silently truncated its head
    and <body> -- a `s.find(marker) + len(marker)` guarded by `assert i > 0`
    yields 21 when the marker is absent. Links, anchors and ids all still passed,
    because none of them look at document structure. This check does.
    """
    problems = []
    for rel in pages:
        src = re.sub(r"<!--[\s\S]*?-->", "", read(os.path.join(ROOT, rel)))
        for tag in ("html", "head", "body"):
            n = len(re.findall(r"<%s\b[^>]*>" % tag, src))
            if n != 1:
                problems.append("%s has %d <%s> opening tag(s)" % (rel, n, tag))
        if src.count("</body>") != 1:
            problems.append("%s has %d </body>" % (rel, src.count("</body>")))
        if 'rel="stylesheet"' not in src:
            problems.append("%s loads no stylesheet" % rel)
    rep.add("document-structure", "fail", not problems,
            "%d page(s) checked for one html/head/body and a stylesheet" % len(pages), problems)


def baseline_inner(fallback_html: str) -> str:
    """Inner HTML of a page-nav block, with the opening tag removed.

    Stage 2b adds `data-page-nav` to the opening tag, which is deliberately not
    a navigation change -- so drift is measured on the contents only.

    Line endings are normalised for the same reason. The fixture was captured
    when the tree was CRLF; the rewrite tools now write LF, so an untouched nav
    block would otherwise read as drift on every page they rewrite.
    """
    inner = re.sub(r'^<div class="page-nav"[^>]*>', "", fallback_html)
    inner = re.sub(r"</div>$", "", inner).strip()
    return inner.replace("\r\n", "\n").replace("\r", "\n")


def current_nav_block(src: str) -> str | None:
    match = re.search(r'<div class="page-nav"[^>]*>', src)
    if not match:
        return None
    depth, index, start = 0, match.start(), match.start()
    while index < len(src):
        if src.startswith("<div", index):
            depth += 1
            index += 4
        elif src.startswith("</div>", index):
            depth -= 1
            index += 6
            if depth == 0:
                return src[start:index]
        else:
            index += 1
    return src[start:]


def check_baseline(rep: Report, man: dict):
    path = os.path.join(ROOT, "tools", "baselines", "nav-baseline.json")
    if not os.path.exists(path):
        rep.add("nav-baseline", "fail", False, "tools/baselines/nav-baseline.json is missing")
        return
    data = json.loads(read(path))
    frozen_ok = (data["pageCount"] == 150 and data["pagesWithNavBlock"] == 149
                 and data["pagesWithoutNavBlock"] == 1)
    proc = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "extract-nav-baseline.py"),
                           "--check"], capture_output=True, text=True)
    rep.add("nav-baseline", "fail", frozen_ok and proc.returncode == 0,
            "immutable Release 1 fixture: %d pages, %d with a nav block, %d without; "
            "extraction deterministic: %s"
            % (data["pageCount"], data["pagesWithNavBlock"], data["pagesWithoutNavBlock"],
               "yes" if proc.returncode == 0 else "NO"))

    # ---- drift, measured on inner HTML only ----------------------------------
    reg = man["pages"]
    full = man["routes"]["full"]
    order = [s["page"] for s in full["steps"]]
    by_path = {p["path"]: pid for pid, p in reg.items()}

    def rel_link(from_id, to_id):
        base = os.path.dirname(reg[from_id]["path"])
        return os.path.relpath(reg[to_id]["path"], base or ".").replace(os.sep, "/")

    # Approved differences, with destinations derived from the manifest rather
    # than typed: the pages either side of step 14, and step 68 -> route.finish.
    ta = "teach-agents/index.html"
    js = "job-search/index.html"
    i_ta, i_js = order.index(by_path[ta]), order.index(by_path[js])
    approved = {
        ta: {"prev": rel_link(by_path[ta], order[i_ta - 1]),
             "next": rel_link(by_path[ta], order[i_ta + 1])},
        js: {"prev": rel_link(by_path[js], order[i_js - 1]),
             "next": rel_link(by_path[js], full["finish"]["page"])},
        # The rewrite of rag-deep-dive.html replaced its section ids, so the
        # fragments these two fallbacks carried (#guardrails, #output-eval) no
        # longer exist. The destination page is unchanged; only the dead
        # fragment was dropped. In-body links were remapped to live anchors --
        # see claude_plan.md 8.3 -- but a nav fallback names its topic in the
        # title, so the page root is the honest target here.
        "guardrails.html": {"prev": "rag-deep-dive.html", "next": "langfuse.html"},
        "langfuse.html": {"prev": "modules/14_production_genai.html",
                          "next": "rag-deep-dive.html"},
    }

    differing, wrong_dest, missing_attr = [], [], []
    for rel, entry in sorted(data["pages"].items()):
        src = read(os.path.join(ROOT, rel))
        block = current_nav_block(src)
        if block is None:
            if rel in approved:
                wrong_dest.append("%s: approved change but no nav block found" % rel)
            elif entry is not None:
                differing.append("%s: baseline had a nav block, the page now has none" % rel)
            continue
        if "data-page-nav" not in block[:block.index(">") + 1]:
            missing_attr.append(rel)
        now = baseline_inner(block)
        was = baseline_inner(entry["fallbackHtml"]) if entry else None
        if was is None or now != was:
            if rel not in approved:
                differing.append(rel)

    for rel, want in approved.items():
        src = read(os.path.join(ROOT, rel))
        parsed = None
        block = current_nav_block(src)
        if block:
            anchors = re.findall(r"<a\b([^>]*)>", block)
            hrefs = {}
            for attrs in anchors:
                href = re.search(r'href="([^"]*)"', attrs)
                hrefs["next" if 'class="next"' in attrs else "prev"] = href.group(1) if href else None
            parsed = hrefs
        if parsed != want:
            wrong_dest.append("%s: fallback %s, manifest expects %s" % (rel, parsed, want))

    rep.add("nav-baseline-drift", sev(rep, "2b"), not differing and not wrong_dest,
            "%d approved difference(s): %s; %d unexpected"
            % (len(approved), ", ".join(sorted(approved)), len(differing)),
            differing + wrong_dest)
    rep.add("page-nav-annotated", sev(rep, "2b"), not missing_attr,
            "%d block(s) missing data-page-nav" % len(missing_attr), missing_attr)


# ------------------------------------------------------------------------- main
# -------------------------------------------------------------- release 3.1
CANONICAL_PAGE = "modules/09_mcp.html"
CANONICAL_ANCHOR = "middleware-identity-interoperability"
DRILL_PAGE = "interview-prep/03-agents-mcp.html"
DRILL_ANCHOR = "middleware-identity-interview"


def check_job_ready_insertion(rep: Report, man: dict):
    """Release 3.1 inserts mcp-module into Job-Ready and changes nothing else."""
    fixture = os.path.join(ROOT, "tools", "baselines", "job-ready-r3.json")
    problems = []
    steps = [s2["page"] for s2 in man["routes"]["job-ready"]["steps"]]
    if not os.path.exists(fixture):
        problems.append("tools/baselines/job-ready-r3.json is missing")
    else:
        r3 = json.loads(read(fixture))["steps"]
        if len(steps) != 27:
            problems.append("Job-Ready has %d steps, expected 27" % len(steps))
        if [p for p in steps if p != "mcp-module"] != r3:
            problems.append("Job-Ready changed by more than the mcp-module insertion")
        if steps.count("mcp-module") != 1:
            problems.append("mcp-module appears %d time(s)" % steps.count("mcp-module"))
        else:
            at = steps.index("mcp-module")
            if steps[at - 1] != "ta-l14":
                problems.append("mcp-module follows %r, expected ta-l14" % steps[at - 1])
            if steps[at + 1] != "langgraph-asyncio":
                problems.append("mcp-module precedes %r, expected langgraph-asyncio"
                                % steps[at + 1])
    for rid, size in (("full", 69), ("interview-sprint", 28)):
        live = [s2["page"] for s2 in man["routes"][rid]["steps"]]
        if len(live) != size:
            problems.append("%s has %d steps, expected %d (unchanged)" % (rid, len(live), size))
        if rid != "job-ready" and "mcp-module" not in live:
            problems.append("%s no longer contains mcp-module" % rid)
    rep.add("job-ready-insertion", sev(rep, "3.1"), not problems,
            "Job-Ready 26 -> 27, mcp-module between ta-l14 and langgraph-asyncio; "
            "Full 69 and Sprint 28 unchanged", problems)


def check_middleware_content(rep: Report, ids: dict[str, set]):
    """The canonical section and its drill exist, are anchored, and are paired."""
    problems = []
    canon = read(os.path.join(ROOT, CANONICAL_PAGE))
    drill = read(os.path.join(ROOT, DRILL_PAGE))

    if '<section id="%s">' % CANONICAL_ANCHOR not in canon:
        problems.append("%s has no <section id=%r>" % (CANONICAL_PAGE, CANONICAL_ANCHOR))
    if "Middleware, Identity and Agent Interoperability" not in canon:
        problems.append("%s does not carry the section title" % CANONICAL_PAGE)
    if "Last reviewed: August 2026" not in canon:
        problems.append("%s has no review date" % CANONICAL_PAGE)
    if "middleware-references" not in ids.get(CANONICAL_PAGE, set()):
        problems.append("%s has no References anchor" % CANONICAL_PAGE)
    # The section must reach the page's own table of contents, which app.js
    # builds from h2[id] inside .content.
    if not re.search(r'<h2 id="[^"]+">[^<]*Middleware, Identity and Agent Interoperability',
                     canon):
        problems.append("the section title is not an h2[id], so it misses the page TOC")

    if '<section id="%s">' % DRILL_ANCHOR not in drill:
        problems.append("%s has no <section id=%r>" % (DRILL_PAGE, DRILL_ANCHOR))
    if "Middleware, Identity and Interoperability" not in drill:
        problems.append("%s does not carry the drill title" % DRILL_PAGE)

    start = drill.find('<section id="%s">' % DRILL_ANCHOR)
    if start == -1:
        problems.append("cannot locate the drill section to count its questions")
    else:
        added = len(re.findall(r'<details class="prep-question"', drill[start:]))
        if added != 10:
            problems.append("the drill section holds %d prep-question block(s), expected 10"
                            % added)
    if "%s#%s" % ("../" + CANONICAL_PAGE, CANONICAL_ANCHOR) not in drill:
        problems.append("%s does not link back to the canonical section" % DRILL_PAGE)
    if "#%s" % DRILL_ANCHOR not in canon:
        problems.append("%s does not link forward to the drill" % CANONICAL_PAGE)
    rep.add("middleware-section", sev(rep, "3.1"), not problems,
            "canonical section, review date, References anchor, TOC heading, "
            "drill section and 10 new question(s)", problems)


def check_middleware_cross_links(rep: Report):
    """Five pages point at the canonical anchor, and none of them competes with it."""
    expected = {
        CANONICAL_PAGE: "#" + CANONICAL_ANCHOR,
        DRILL_PAGE: "../modules/09_mcp.html#" + CANONICAL_ANCHOR,
        "agent-protocols.html": "modules/09_mcp.html#" + CANONICAL_ANCHOR,
        "guardrails.html": "modules/09_mcp.html#" + CANONICAL_ANCHOR,
        "modules/14_production_genai.html": "09_mcp.html#" + CANONICAL_ANCHOR,
    }
    problems = []
    for rel, href in sorted(expected.items()):
        src = read(os.path.join(ROOT, rel))
        if 'href="%s"' % href not in src:
            problems.append("%s does not link to %s" % (rel, href))
        if rel != CANONICAL_PAGE and "Trust boundary 1" in src:
            problems.append("%s duplicates the canonical explanation" % rel)
    rep.add("middleware-cross-links", sev(rep, "3.1"), not problems,
            "%d page(s) reference the canonical anchor" % len(expected), problems)


def check_basics_duration(rep: Report, man: dict):
    """The Basics preflight duration is the published one, and no route hour
    figure was invented for Sprint or Job-Ready off the back of it."""
    problems = []
    dur = (man["pages"]["beginner-basics"].get("durations") or {}).get("full")
    if dur != [30, 45]:
        problems.append("beginner-basics durations.full is %r, expected [30, 45]" % (dur,))
    plan = read(os.path.join(ROOT, "study-plan.html"))
    if "30\u201345 minutes" not in plan:
        problems.append("study-plan.html no longer states the 30-45 minute figure")
    if 'data-metric-minutes="basics-preflight-minutes"' not in plan:
        problems.append("the visible minute claim is not marked")

    # Nothing may publish an hour total for a route that still depends on a
    # partial agents-course aggregate.
    for name, spec in man["metrics"].items():
        route = ((spec.get("source") or {}).get("route"))
        if route in ("interview-sprint", "job-ready"):
            problems.append("metric %r publishes hours for %r, which has no supported total"
                            % (name, route))
    cfg = json.loads(read(os.path.join(ROOT, "tools", "metrics.config.json")))
    for claim in cfg["claims"]:
        spec = man["metrics"].get(claim["metric"]) or {}
        if ((spec.get("source") or {}).get("route")) in ("interview-sprint", "job-ready"):
            problems.append("claim %r publishes a duration for a route without a "
                            "supported total" % claim["id"])
    rep.add("basics-duration", sev(rep, "3.1"), not problems,
            "beginner-basics is 30-45 min from published copy; no Sprint or "
            "Job-Ready hour total is claimed", problems)


REWRITE_SECTIONS = [
    ("known", "What you already know"),
    ("breaks", "What breaks now"),
    ("breakdown", "Simple breakdown"),
    ("without", "Without the technology"),
    ("mechanics", "Runtime mechanics"),
    ("smallest", "Smallest working version"),
    ("components", "The components, one at a time"),
    ("state", "State and data flow"),
    ("assembly", "Full code, in assembly order"),
    ("trace", "Trace"),
    ("break", "Break it"),
    ("fix", "Fix it"),
    ("production", "Production version"),
    ("comparison", "Comparison"),
    ("interview", "Interview preparation"),
    ("short", "In short"),
]

BD_LABELS = ["What it is.", "Core purpose.", "Execution model.",
             "Architecture under the hood.", "State handling.",
             "Limitations and advanced features."]


def check_rewritten_pages(rep: Report, pages: list[str]):
    """Structure checks for pages converted to the 16-section rewrite template.

    Scoped by content, not by a manifest flag: a page is "rewritten" once it
    contains a `<section class="breakdown">`. That way the checks switch on one
    page at a time as the waves land, and the 100-odd pages still on the old
    template never fail for not being rewritten yet.

    The interview rule is the important one. The rewrite deliberately discards
    every other section, so the questions exist only in the carry-over archive
    and in git. This check is what stops a page shipping without them.
    """
    try:
        carry = json.loads(read(os.path.join(ROOT, "docs", "carryover", "index.json")))
        archived = {r["path"]: r for r in carry["pages"]}
    except Exception:
        archived = {}

    done, missing_sec, bad_block, thin_svg, lost_qs = [], [], [], [], []

    for rel in pages:
        src = read(os.path.join(ROOT, rel))
        if '<section class="breakdown"' not in src:
            continue
        done.append(rel)

        have = set(re.findall(r'<h2 id="([^"]+)"', src))
        for sid, title in REWRITE_SECTIONS:
            if sid not in have:
                missing_sec.append("%s: no <h2 id=\"%s\"> (%s)" % (rel, sid, title))

        block = re.search(r'(?s)<section class="breakdown">(.*?)</section>', src)
        if block:
            body = block.group(1)
            for lab in BD_LABELS:
                if body.count(">%s<" % lab) < 2:
                    bad_block.append("%s: label %r not present for both technologies" % (rel, lab))
            if body.count('class="bd-tech"') != 2:
                bad_block.append("%s: expected exactly 2 technologies in the block" % rel)
            if 'class="bd-short"' not in body:
                bad_block.append("%s: block has no 'In short' list" % rel)

        svgs = re.findall(r'(?s)<svg class="bd-svg".*?</svg>', src)
        if len(svgs) < 3:
            thin_svg.append("%s: %d diagram(s), minimum is 3" % (rel, len(svgs)))
        for i, sv in enumerate(svgs, 1):
            if "<title" not in sv or "<desc" not in sv:
                thin_svg.append("%s: diagram %d has no <title>/<desc>" % (rel, i))

        row = archived.get(rel)
        if row:
            sec = re.search(r'(?s)<h2 id="interview"[^>]*>(.*?)(?=<h2[ >]|\Z)', src)
            words = len(re.sub(r"<[^>]+>", " ", sec.group(1)).split()) if sec else 0
            if words < row["words"] * 0.6:
                lost_qs.append("%s: interview section is %d words, archive has %d"
                               % (rel, words, row["words"]))

    rep.add("rewrite-sections", "fail", not missing_sec,
            "%d rewritten page(s): all 16 sections present" % len(done), missing_sec)
    rep.add("rewrite-block", "fail", not bad_block,
            "%d block(s) checked for 6 labels x 2 technologies" % len(done), bad_block)
    rep.add("rewrite-diagrams", "fail", not thin_svg,
            "%d page(s) checked for >=3 described diagrams" % len(done), thin_svg)
    rep.add("interview-carryover", "fail", not lost_qs,
            "%d rewritten page(s) checked against the carry-over archive" % len(done),
            lost_qs)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", default="2a", choices=STAGES)
    ap.add_argument("--skip-tests", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    man = load_manifest()
    if man.get("schema") != 2:
        sys.exit("FATAL: manifest schema %r, expected 2" % man.get("schema"))
    pages = html_pages()
    rep = Report(args.stage)

    ids = check_links(rep, pages)
    check_document_structure(rep, pages)
    check_registry(rep, man, pages)
    check_routes(rep, man, ids)
    check_draft_isolation(rep, man, pages)
    check_collections(rep, man)
    check_retired_links(rep, man, pages)
    metric_rows = check_metrics(rep, man)
    check_metric_claims(rep, man, metric_rows)
    check_identity(rep, man, pages)
    check_fallbacks(rep, man)
    check_runtime_contract(rep)
    check_pilot_scope(rep, man, pages)
    check_metric_namespace(rep, man, pages)
    check_metric_markers(rep, man, pages)
    check_metric_runtime(rep, pages)
    check_metric_tests(rep, args.skip_tests)
    check_route_shape(rep, man)
    check_authored_route_params(rep, man, pages)
    check_route_entries(rep, man, pages)
    check_sidebar_untouched(rep)
    check_job_ready_insertion(rep, man)
    check_middleware_content(rep, ids)
    check_middleware_cross_links(rep)
    check_basics_duration(rep, man)
    check_page_nav_tests(rep, args.skip_tests)
    check_js(rep)
    check_python_snippets(rep, pages)
    check_rewritten_pages(rep, pages)
    check_baseline(rep, man)
    check_tests(rep, args.skip_tests)

    if args.json:
        print(json.dumps({"stage": args.stage, "rows": rep.rows, "metrics": metric_rows}, indent=2))
    else:
        print("portal validator - stage %s - %d pages" % (args.stage, len(pages)))
        print("-" * 78)
        for row in rep.rows:
            mark = {"fail": "FAIL", "report": "warn", "skip": "skip"}[row["severity"]] \
                if not row["ok"] else "ok"
            print("  %-4s %-32s %s" % (mark, row["check"], row["detail"]))
            if not row["ok"]:
                for item in row["items"]:
                    print("         - %s" % item)
        print("-" * 78)
        print("  metrics (minutes -> published unit)")
        for row in metric_rows:
            c, e = row["computed"], row["expect"]
            div = claim_divisor(man, row["metric"])
            unit = "min" if div == 1 else "h"
            fmt = lambda v: "%d-%d %s" % (v[0] // div, v[1] // div, unit) if v else "n/a"
            print("    %-4s %-28s computed %-12s expected %-12s"
                  % ("ok" if row["ok"] else "FAIL", row["metric"], fmt(c), fmt(e)))
        print("-" * 78)
        print("  %d check(s): %d failed, %d warning(s)"
              % (len(rep.rows), len(rep.failures), len(rep.warnings)))
    return 1 if rep.failures else 0


if __name__ == "__main__":
    sys.exit(main())
