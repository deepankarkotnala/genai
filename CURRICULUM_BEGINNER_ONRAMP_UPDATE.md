# GenAI Mastery — beginner on-ramp across all 15 modules

## The problem

Module 01's lead sentence read "a probabilistic next-token predictor wrapped
around a transformer" — *transformer* in the first line of the track, 200 lines
before anything explained it. The first two sections then used *neural network*,
*differentiable function*, *logits*, *softmax*, *vocabulary*, *autoregressive*,
*prefill*, *cached decode*, *in-context learning* and *top-p* without defining
any of them, and the Feynman check asked the reader to explain cached decode
steps — a concept resting on three undefined terms. The material was sound; the
vocabulary it assumed was never handed over.

## New — Module 00 · The Basics

`modules/00_basics.html`, ~30 minutes, no mathematics, no prerequisites. Ten
sections: what a model is (training vs inference), why text becomes tokens, what
a neural network does, **what a transformer is in four sentences** with attention
explained through "river bank" vs "withdrew from the bank", how one guess becomes
a whole answer (logits → softmax → sampling → the loop), why fluent answers can
be false, a one-line glossary of every term the course uses, a map of what each
module unlocks, and five self-check questions.

Registered in `sitenav.js` and `study-data.js` (+30 min, 16 modules), and it is
now the "Start here" target on the home page and the first rung of the reading
map. Module 01's Back link points to it; its Next points to Module 01.

## Every module got the same three treatments

1. **A plain-words opening.** One paragraph at the top of section 1, in the
   simplest language the idea allows, before the precise definition. Modules
   03–15 (Module 00 is itself the plain-language page; 01 got a *Before you
   start* block; 02 got a "this is the module that opens the black box" note).
2. **Click-to-define jargon.** The site's existing `.term-link` + `<dialog>`
   mechanism — previously used on exactly one page and no module page — now
   defines terms in place at first use. 22 definitions across 12 modules:

   | Module | Definitions added |
   | --- | --- |
   | 01 Foundations | transformer, neural network, autoregressive, prefill/decode, logits |
   | 03 Local LLMs | open-weights, VRAM |
   | 04 Embeddings | vector, cosine similarity |
   | 05 Vector DBs | kNN, ANN, HNSW |
   | 06 RAG Basics | chunking, fine-tuning |
   | 07 Advanced RAG | precision & recall, cross-encoder |
   | 08 Agentic AI | tools & tool calling, ReAct |
   | 09 MCP | client and server in MCP terms |
   | 10 LangChain | Runnable and LCEL |
   | 11 LlamaIndex | Document, Node, Index, Query Engine |
   | 12 LangGraph | state/nodes/edges, checkpointing |
   | 13 Multi-agent | topology (supervisor vs network) |
   | 14 Production | non-determinism, tracing, prompt injection |

3. **Signposts instead of bare forward references.** Where a module leans on an
   idea another module owns, it now says so and links: Module 08 points at the
   code-free [What is an agent, really?](teach-agents/lessons/0001-what-is-an-agent.html)
   lesson, Module 01 says the transformer is a black box until Module 02, Module
   04's primer link explains what a vector is, and Module 15 explains how to
   choose a project instead of implying you build all ten.

## Sequencing

The track order was left as it is. 01 → 02 (deep dive) → 03 is sound *provided*
01 does not lean on transformer internals — the fault was vocabulary, not
ordering, and re-cutting the track would have renumbered 15 modules to fix a
problem that a primer plus definitions fixes.

## Fix found on the way

Term-dialog `<h2>` titles were being listed as chapter sections: adding five
definitions to Module 01 turned its contents rail into "20 topics". The three
heading queries (`app.js`, `section-nav.js`, `enhance.js`) now skip headings
inside a `<dialog>`. This was already wrong on
`interview-prep/00-neural-networks.html`, which has carried one such dialog for
some time.

## Audit of forward references

Every module was scanned for terms owned by a later module (using each module's
own `kw` list in `sitenav.js` as its vocabulary). 127 forward references, 92 of
them previously unlinked. Two caveats worth knowing before acting on that number:
single words like *cost*, *python*, *task* and *interview* appear in those lists
and generate false positives, and a forward reference is only a problem when the
term is load-bearing where it appears. The openings — where a lost reader gives
up — are what this pass fixed. The remaining tail is mid-module mentions worth a
look but not a rewrite.

## Verified
Chrome renders of all 16 pages; every term trigger has a matching dialog and
vice versa (checked programmatically); no dead internal links in `modules/`;
dialogs confirmed opening on modules 01 and 14; nav, study-plan totals and
breadcrumbs correct on the new page.
