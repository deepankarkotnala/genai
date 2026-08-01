"""
retrieval.py — retrieval as a tool, built from parts you can explain.

Lesson 5. Wave 1's `search_kb` scored whole articles by counting shared words.
It worked well enough to hide its problem, which is the worst kind of working:
ask it about an "account" question and it confidently returns the refund policy,
because the word "account" appears in the phrase "account credit".

This module fixes that with the three moves that matter in real retrieval, and
nothing else:

  1. CHUNK       score sections, not whole documents
  2. RANK        BM25, so rare words count and long documents do not win by size
  3. RERANK      a second, sharper pass over the top handful

No embedding model, no vector database, no extra dependency. Those are the right
answer at scale and the wrong place to start, because they hide the mechanics
behind an API call. `modules/06_rag_basics.html` covers the dense-vector side;
what matters here is that you can say *why* each stage exists.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Any

# Words too common to carry signal. Kept deliberately short -- an over-eager
# stop list removes terms that matter in a support domain ("no", "not", "over").
STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "for", "on",
    "that", "this", "it", "as", "be", "was", "were", "with", "by", "at", "from",
}

MAX_CHUNK_CHARS = 700
K1 = 1.5   # BM25 term-frequency saturation
B = 0.75   # BM25 length normalisation


@dataclass
class Chunk:
    id: str            # article id + section index, e.g. "refunds#2"
    article: str
    title: str
    section: str
    text: str
    tags: list[str] = field(default_factory=list)


@dataclass
class Hit:
    chunk: Chunk
    score: float
    why: str  # human-readable reason, so a trace can be read without guessing


# --------------------------------------------------------------------------
# 1 · Chunking
# --------------------------------------------------------------------------
def chunk_article(article: dict[str, Any]) -> list[Chunk]:
    """
    Split one article on markdown headings, then on paragraphs if a section is
    still too long.

    Heading-based chunking is chosen over fixed-size windows because these
    documents already have meaningful boundaries. Cutting every 500 characters
    would split a numbered policy list in half, and half a policy is worse than
    none -- it reads as complete while omitting the condition that matters.
    """
    text = article["text"]
    title = article["title"]
    parts: list[tuple[str, str]] = []
    current_head, buffer = title, []

    for line in text.splitlines():
        if line.startswith("#"):
            if buffer:
                parts.append((current_head, "\n".join(buffer).strip()))
                buffer = []
            current_head = line.lstrip("# ").strip()
        else:
            buffer.append(line)
    if buffer:
        parts.append((current_head, "\n".join(buffer).strip()))

    chunks: list[Chunk] = []
    for head, body in parts:
        if not body:
            continue
        for piece in _split_long(body):
            chunks.append(
                Chunk(
                    id=f"{article['id']}#{len(chunks)}",
                    article=article["id"],
                    title=title,
                    section=head,
                    text=piece,
                    tags=article.get("tags", []),
                )
            )
    return chunks


def _split_long(body: str) -> list[str]:
    if len(body) <= MAX_CHUNK_CHARS:
        return [body]
    out, current = [], ""
    for para in body.split("\n\n"):
        if current and len(current) + len(para) > MAX_CHUNK_CHARS:
            out.append(current.strip())
            current = para
        else:
            current = f"{current}\n\n{para}".strip()
    if current:
        out.append(current.strip())
    return out


# --------------------------------------------------------------------------
# 2 · BM25 ranking
# --------------------------------------------------------------------------
def tokenize(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9_]+", text.lower()) if t not in STOPWORDS]


def bm25(query: str, chunks: list[Chunk]) -> list[Hit]:
    """
    Score every chunk against the query.

    Why BM25 rather than counting shared words:

    * **Rare words count more** (the IDF term). "refund" appearing in one chunk
      out of twenty is strong evidence; "support" appearing in all twenty is
      none. Wave 1's word count treated them identically -- that is precisely
      why an "account" query surfaced the refund policy.
    * **Long chunks stop winning by size** (the length normalisation). Without
      it, the longest document tends to score highest for every query.
    * **Repetition saturates** (the k1 term). The tenth occurrence of a word
      adds far less than the second.
    """
    q_terms = tokenize(query)
    if not q_terms or not chunks:
        return []

    docs = [tokenize(f"{c.section} {c.text} {' '.join(c.tags)}") for c in chunks]
    n = len(docs)
    avg_len = sum(len(d) for d in docs) / n

    df: dict[str, int] = {}
    for d in docs:
        for term in set(d):
            df[term] = df.get(term, 0) + 1

    hits: list[Hit] = []
    for chunk, doc in zip(chunks, docs):
        score, matched = 0.0, []
        length = len(doc) or 1
        for term in set(q_terms):
            tf = doc.count(term)
            if not tf:
                continue
            idf = math.log(1 + (n - df[term] + 0.5) / (df[term] + 0.5))
            norm = tf * (K1 + 1) / (tf + K1 * (1 - B + B * length / avg_len))
            score += idf * norm
            matched.append(term)
        if score > 0:
            hits.append(
                Hit(chunk=chunk, score=round(score, 3),
                    why=f"bm25 on {', '.join(sorted(matched))}")
            )
    hits.sort(key=lambda h: (-h.score, h.chunk.id))
    return hits


# --------------------------------------------------------------------------
# 3 · Reranking
# --------------------------------------------------------------------------
def rerank(query: str, hits: list[Hit], top_n: int = 8) -> list[Hit]:
    """
    A cheap second pass over the top `top_n` only.

    That "top_n only" is the whole economic argument for reranking: the first
    stage is fast and mediocre over everything; the second is slower and sharper
    over a shortlist. In production the second stage is usually a cross-encoder
    model. The *shape* is identical, and the shape is what interviews probe.

    Signals here: the query appearing as a phrase, overlap with the section
    heading, and how much of the query the chunk covers. A chunk matching one
    query word out of five is a weaker answer than one matching four, and raw
    BM25 does not express that directly.
    """
    q_terms = set(tokenize(query))
    phrase = " ".join(tokenize(query))
    out: list[Hit] = []
    for h in hits[:top_n]:
        bonus, reasons = 0.0, [h.why]
        body = h.chunk.text.lower()
        if phrase and phrase in " ".join(tokenize(h.chunk.text)):
            bonus += 2.0
            reasons.append("exact phrase")
        head_overlap = q_terms & set(tokenize(h.chunk.section))
        if head_overlap:
            bonus += 1.2 * len(head_overlap)
            reasons.append(f"heading match: {', '.join(sorted(head_overlap))}")
        coverage = len(q_terms & set(tokenize(body))) / max(len(q_terms), 1)
        bonus += coverage * 1.5
        reasons.append(f"covers {coverage:.0%} of query")
        out.append(Hit(chunk=h.chunk, score=round(h.score + bonus, 3),
                       why=" | ".join(reasons)))
    out.sort(key=lambda h: (-h.score, h.chunk.id))
    return out


# --------------------------------------------------------------------------
# 4 · The retrieve entry point
# --------------------------------------------------------------------------
def retrieve(
    query: str,
    articles: list[dict[str, Any]],
    *,
    limit: int = 3,
    use_rerank: bool = True,
    min_score: float = 1.0,
) -> dict[str, Any]:
    """
    Chunk, rank, optionally rerank, and return citable results.

    `min_score` is the part people leave out. Without a floor, retrieval always
    returns its `limit` best chunks however bad they are, and the agent treats
    the least-bad chunk as an answer. Returning *nothing* is a valid, useful
    result: it lets the agent say "no policy covers this" and escalate instead
    of grounding a confident reply in an irrelevant paragraph.
    """
    chunks: list[Chunk] = []
    for article in articles:
        chunks.extend(chunk_article(article))

    ranked = bm25(query, chunks)
    if use_rerank:
        ranked = rerank(query, ranked)
    kept = [h for h in ranked if h.score >= min_score][:limit]

    return {
        "query": query,
        "chunks_searched": len(chunks),
        "returned": len(kept),
        "articles": [
            {
                "id": h.chunk.article,
                "chunk_id": h.chunk.id,
                "title": h.chunk.title,
                "section": h.chunk.section,
                "score": h.score,
                "why": h.why,
                "snippet": h.chunk.text[:320].strip(),
            }
            for h in kept
        ],
        "note": None if kept else "no article passed the relevance floor",
    }
