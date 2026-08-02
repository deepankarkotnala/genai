"""
Tests for retrieval (Lesson 5): chunking, BM25, reranking, the relevance floor.
"""

from agent.retrieval import bm25, chunk_article, rerank, retrieve, tokenize
from agent.tools import _load_kb, search_kb, search_kb_keyword


# -- chunking --------------------------------------------------------------
def test_articles_are_chunked_by_heading():
    chunks = []
    for a in _load_kb():
        chunks.extend(chunk_article(a))
    assert len(chunks) > len(_load_kb()), "chunking should produce more parts than files"
    assert all(c.id.count("#") == 1 for c in chunks)
    assert all(c.text.strip() for c in chunks)


def test_chunk_ids_are_citable_and_unique():
    ids = [c.id for a in _load_kb() for c in chunk_article(a)]
    assert len(ids) == len(set(ids))


def test_chunks_carry_their_section_heading():
    chunks = [c for a in _load_kb() for c in chunk_article(a)]
    assert any(c.section and c.section != c.title for c in chunks)


# -- ranking ---------------------------------------------------------------
def test_tokenize_drops_stopwords_but_keeps_domain_terms():
    tokens = tokenize("What is the refund policy for an order")
    assert "refund" in tokens and "policy" in tokens and "order" in tokens
    assert "the" not in tokens and "is" not in tokens


def test_bm25_ranks_the_right_chunk_first():
    chunks = [c for a in _load_kb() for c in chunk_article(a)]
    hits = bm25("duplicate charge", chunks)
    assert hits
    assert hits[0].chunk.article == "billing-duplicate-charges"


def test_bm25_explains_itself():
    chunks = [c for a in _load_kb() for c in chunk_article(a)]
    hits = bm25("refund", chunks)
    assert "bm25 on" in hits[0].why


def test_rerank_adds_signal_and_never_grows_the_list():
    chunks = [c for a in _load_kb() for c in chunk_article(a)]
    ranked = bm25("checkout 502", chunks)
    reranked = rerank("checkout 502", ranked)
    assert len(reranked) <= len(ranked)
    assert reranked[0].score >= ranked[0].score
    assert "covers" in reranked[0].why


# -- the floor -------------------------------------------------------------
def test_irrelevant_query_returns_nothing_rather_than_the_least_bad_chunk():
    """
    The single most important behaviour in this module. An agent handed the
    least-bad paragraph will ground a confident answer in it; an agent handed
    nothing can escalate honestly.
    """
    out = retrieve("quantum tunnelling in badgers", _load_kb())
    assert out["returned"] == 0
    assert out["note"] == "no article passed the relevance floor"


def test_raising_the_floor_trades_recall_for_precision():
    loose = retrieve("account", _load_kb(), min_score=0.5)
    strict = retrieve("account", _load_kb(), min_score=5.0)
    assert loose["returned"] >= strict["returned"]


# -- against the Wave 1 implementation -------------------------------------
def test_retrieval_is_more_selective_than_keyword_overlap():
    """
    Wave 1's word count returned two articles for an account question, one of
    them the refund policy, because "account" appears in "account credit".
    Retrieval weights rare terms and scores sections, so it returns less.
    """
    q = "account email change"
    assert search_kb(q, 3)["returned"] < search_kb_keyword(q, 3)["returned"]


def test_search_kb_returns_chunk_level_citations():
    out = search_kb("duplicate charge refund", 2)
    assert out["returned"] >= 1
    for a in out["articles"]:
        assert "#" in a["chunk_id"], "citations must identify the paragraph, not just the file"
        assert a["section"]
        assert a["why"]


def test_search_kb_reports_how_much_it_searched():
    assert search_kb("refund")["chunks_searched"] > 0


def test_snippets_are_capped():
    for a in search_kb("refund policy order", 3)["articles"]:
        assert len(a["snippet"]) <= 320
