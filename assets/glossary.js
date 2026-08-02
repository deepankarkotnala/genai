/* =========================================================================
   GenAI Mastery / Understanding AI Agents — Jargon glossary
   ------------------------------------------------------------------------
   One central glossary + a small runtime annotator. Every technical term a
   beginner is likely to trip over becomes a `.term-link` — the same green,
   ⓘ-suffixed inline button the hand-written "additional read" terms already
   use — and clicking it opens a plain-English explanation in a modal.

   ONE interaction, everywhere: click / tap. No hover popups. Hover-only
   affordances do not exist on a phone, and having two different popup styles
   on one page reads as two different features. This matches the hand-authored
   term dialogs already in the prose, so the page has a single vocabulary for
   "there is more to read about this word".

   Why a runtime pass instead of editing the prose: the same 200 terms appear
   thousands of times across ~30 lesson pages. Marking them by hand would be
   unreviewable and would rot the moment a page is rewritten. Here the glossary
   is one list, and any page that loads this file gets it.

   What is deliberately NOT annotated:
     - anything inside <pre>, <code>, <kbd>, <samp>  (code should read as code)
     - links, buttons, headings, tables of contents, the sidebar and the
       existing .term-link deep-dive triggers (they already explain themselves)
     - repeats: each concept is marked once per page, at its first appearance,
       so the prose stays readable rather than turning into a field of links.

   Pure vanilla JS, no deps, offline-safe. Pairs with assets/glossary.css.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     The glossary. Each entry:
        [ term | [term, alias, alias…], plain meaning, "exact"? ]
     Aliases share one definition (e.g. "context window" / "context length").
     Keep definitions to one sentence a non-engineer could read aloud.

     The optional third field turns OFF the automatic plural match. Use it on
     any term whose plural is a common English verb — without it "recall" also
     fires on "the reader recalls", and a confidently wrong tooltip is worse
     than no tooltip.

     Some entries exist purely to SHADOW a shorter one: "stack trace" and
     "16-bit precision" are listed so that "trace" and "precision" cannot claim
     them, because longer phrases are matched first.
     --------------------------------------------------------------------- */
  var GLOSSARY = [
    /* ---- Core LLM ---- */
    [["LLM", "large language model"], "Large Language Model — a program trained on huge amounts of text that predicts the next piece of text, which is how it appears to write and reason."],
    [["token", "tokens"], "A chunk of text the model actually reads — roughly a short word or word-piece. Models are billed and limited in tokens, not words."],
    ["tokenizer", "The component that chops text into tokens before the model sees it, and glues them back into text afterwards."],
    [["tokenisation", "tokenization"], "The step of splitting text into tokens — the model's unit of reading and writing."],
    [["context window", "context length"], "The maximum amount of text (in tokens) a model can hold in mind at once — prompt plus answer. Anything beyond it must be dropped or summarised."],
    [["prompt", "prompts"], "The text you send the model — instructions, background and the question — which is the only thing it knows about your task."],
    ["system prompt", "The standing instructions placed at the top of every conversation, telling the model who it is and what rules it must follow."],
    ["prompt engineering", "Writing and refining instructions so the model reliably produces what you want, without retraining it."],
    ["few-shot", "Showing the model two or three worked examples inside the prompt so it copies the pattern."],
    ["zero-shot", "Asking the model to do a task with instructions only, no worked examples."],
    ["chain-of-thought", "Asking the model to work through its reasoning step by step before answering, which improves accuracy on multi-step problems."],
    [["inference", "inference time"], "Actually running a trained model to get an answer (as opposed to training it)."],
    ["training", "The expensive one-off process of teaching a model from data. Using the model afterwards is inference."],
    [["fine-tuning", "fine-tune", "fine-tuned"], "Further training a ready-made model on your own examples so it adapts to your style, format or domain."],
    [["LoRA", "QLoRA"], "A cheap fine-tuning trick that trains a small add-on layer instead of the whole model, so it fits on modest hardware."],
    [["weights", "model weights"], "The billions of internal numbers a model learned during training — they are what the model 'knows'."],
    ["state of the art", "The best result anyone has publicly achieved on a task so far."],
    [["hallucination", "hallucinations", "hallucinate"], "When the model states something fluent and confident that is simply not true, because it is predicting plausible text rather than looking anything up."],
    [["temperature"], "A dial for randomness: near 0 the model plays it safe and repeats itself, higher values make it more varied and more creative — and more error-prone."],
    [["top-p", "nucleus sampling"], "An alternative randomness dial: the model only picks from the smallest set of likely next words that together cover p of the probability."],
    ["top-k", "Only consider the k most likely options — used both for word choice and for 'return the k best search results'."],
    [["sampling", "decoding"], "How the model picks the next token from its list of candidates — greedy, random, or somewhere in between."],
    ["greedy decoding", "Always taking the single most likely next token. Predictable, but often flat and repetitive."],
    ["logits", "The raw, unscaled scores the model gives every possible next token before they are turned into probabilities."],
    ["softmax", "The maths step that turns raw scores into probabilities that add up to 1."],
    ["perplexity", "A score for how 'surprised' a model is by text — lower means the text was easier for it to predict."],
    ["determinism", "Getting the identical answer every time for the identical input — hard with language models, and something you must design for."],
    ["structured output", "Forcing the model to answer in a fixed machine-readable shape (usually JSON) instead of free prose, so code can use it safely."],
    ["JSON mode", "A model setting that guarantees the reply is valid JSON."],
    [["stop sequence", "stop sequences"], "A piece of text that tells the model to stop generating the moment it produces it."],
    ["max tokens", "A hard cap on how long the model's answer may be."],
    [["streaming", "stream"], "Sending the answer word by word as it is produced, so the user sees something immediately instead of waiting for the whole reply."],
    ["TTFT", "Time To First Token — how long the user stares at nothing before the first word appears."],
    ["throughput", "How much work the system gets through per second — for example tokens produced or requests served."],
    [["latency", "p99", "p95"], "How long a request takes. p95/p99 mean 'the slowest 5% / 1% of requests', which is what users actually complain about."],
    ["prefill", "The first phase of a request, where the model reads your whole prompt at once. Long prompts make this phase expensive."],
    [["decode", "token generation"], "The second phase of a request, where the model writes the answer one token at a time."],
    ["KV cache", "Memory of the prompt the model already processed, kept so each new word does not force it to re-read everything. Fast, but it eats GPU memory."],
    ["prompt caching", "Reusing the provider's processing of an unchanged prompt prefix across calls, which cuts both cost and latency."],
    [["context rot", "lost in the middle"], "The tendency of models to pay less attention to material buried in the middle of a very long prompt."],

    /* ---- Neural-network basics ---- */
    [["neural network", "neural net"], "A long chain of stages of arithmetic. Numbers go in, each stage multiplies them by its stored settings and passes the result on; those settings are what training adjusts."],
    ["deep learning", "Machine learning using neural networks with many stacked layers, which is what made modern AI work."],
    ["machine learning", "Getting a program to work out the rules from examples, instead of a person writing the rules by hand."],
    ["backpropagation", "The training step that works out how much each internal setting contributed to the error, so it can be nudged the right way."],
    ["gradient descent", "Training by repeatedly taking a small step in whichever direction reduces the error."],
    ["loss function", "The formula that scores how wrong the model's output was — the number training tries to make small."],
    ["activation function", "The small non-linear squash applied after each stage, which is what lets a network learn anything more interesting than a straight line."],
    ["overfitting", "When a model memorises its training examples instead of learning the pattern, so it does well in testing and badly in the real world."],
    ["epoch", "One full pass of the training data through the model."],
    ["vocabulary", "The fixed list of tokens a model knows. Anything you type is expressed as a sequence drawn from it."],
    [["NLP", "natural language processing"], "Natural Language Processing — the field of getting computers to work with human language."],

    /* ---- Transformers ---- */
    ["transformer", "The neural-network design behind nearly all modern language models; its key idea is attention — every word can look at every other word."],
    [["attention", "self-attention"], "The mechanism that lets each word in a sentence weigh up every other word to work out what it means in context."],
    ["multi-head attention", "Running attention several times in parallel, so different 'heads' can track different kinds of relationship (grammar, topic, reference)."],
    [["QKV", "query, key, value"], "The three roles each word plays in attention: what it is looking for (query), what it advertises (key) and what it passes on (value)."],
    ["positional encoding", "Extra signal added to each token telling the model where in the sequence it sits, since attention alone has no sense of order."],
    ["RoPE", "Rotary Positional Embedding — the common modern way of encoding word order, which extends gracefully to longer inputs."],
    ["feedforward", "The small per-token neural network that sits after each attention step and does most of the actual 'thinking'."],
    [["residual", "residual connection", "skip connection"], "A shortcut that adds a layer's input to its output, which keeps very deep networks trainable."],
    [["layernorm", "layer normalisation", "layer normalization"], "A stabilising step that rescales numbers inside the network so training does not blow up."],
    ["encoder", "The half of a transformer that reads and understands input. Search and embedding models are usually encoder-only."],
    ["decoder", "The half of a transformer that writes output one token at a time. Chat models are usually decoder-only."],
    ["causal masking", "Blocking the model from peeking at future words while it learns to predict them."],
    [["GQA", "grouped-query attention"], "A memory-saving variant of attention where several query heads share one set of keys and values — why local models fit on smaller GPUs."],
    [["MoE", "mixture of experts"], "A model split into many specialist sub-networks where only a few run per token, giving big-model quality at smaller-model running cost."],
    ["embedding layer", "The first step of a model, which turns each token id into a list of numbers the network can work with."],

    /* ---- Local models / serving ---- */
    ["Ollama", "A tool for downloading and running open language models on your own machine with one command."],
    ["Modelfile", "Ollama's small recipe file that pins a base model plus its system prompt and settings into a reusable custom model."],
    [["quantization", "quantisation", "quantized", "quantised"], "Storing a model's numbers at lower precision (say 4-bit instead of 16-bit) so it needs far less memory, at a small cost in quality."],
    ["GGUF", "The common file format for quantized models that run on ordinary laptops and CPUs."],
    ["VRAM", "The memory on your graphics card. A model must fit in it to run fast — this is usually the binding constraint locally."],
    ["GPU", "The graphics processor that does the heavy parallel maths; language models are far faster on one than on a CPU."],
    [["vLLM", "TGI"], "Production serving engines that batch many users' requests together to get much more throughput out of one GPU."],
    ["batching", "Processing several requests together in one pass so the hardware is used efficiently."],
    ["tok/s", "Tokens per second — the speed at which a model produces text."],
    ["open-weight", "A model whose trained numbers are published, so you can download and run it yourself instead of calling someone's API."],

    /* ---- Embeddings & vector search ---- */
    [["embedding", "embeddings"], "A list of numbers representing a piece of text's meaning, so that similar meanings end up close together numerically."],
    [["vector", "vectors"], "Just a list of numbers. In this context, the numeric fingerprint of a piece of text."],
    [["cosine similarity", "cosine"], "A score from -1 to 1 for how similar two embeddings point — the usual way of asking 'do these two texts mean the same thing?'"],
    [["dot product"], "A cheaper similarity score between two vectors; like cosine similarity but also affected by their length."],
    [["Euclidean", "L2"], "Straight-line distance between two vectors — smaller means more similar."],
    [["semantic search", "semantic"], "Searching by meaning rather than exact words, so 'car won't start' can find a document about a dead battery."],
    ["keyword search", "Classic search that matches the literal words you typed. Precise on names and codes, blind to synonyms."],
    [["BM25", "TF-IDF"], "Well-established keyword-scoring formulas that rank documents by how rare and how frequent your search words are in them."],
    ["sparse", "A representation with mostly zeros, one slot per vocabulary word — how keyword search sees text."],
    ["dense", "A compact representation where every number carries meaning — how embedding search sees text."],
    [["vector database", "vector store", "vectorstore"], "A database built to store embeddings and find the nearest ones fast."],
    [["ANN", "approximate nearest neighbour", "approximate nearest neighbor"], "Finding almost-certainly-the-closest matches quickly instead of exactly-the-closest slowly — the trade every vector database makes."],
    ["HNSW", "The most common index for vector search: a layered graph you hop across to reach near neighbours in milliseconds."],
    ["FAISS", "A fast open-source library for vector similarity search, usually run in-process rather than as a server."],
    ["Qdrant", "An open-source vector database that runs as a service, with filtering and persistence built in."],
    ["pgvector", "An extension that lets ordinary PostgreSQL store and search embeddings, so you avoid running a second database."],
    ["recall", "The share of the truly relevant results your search actually returned. Missing documents is a recall problem.", "exact"],
    ["precision", "The share of returned results that were actually relevant. Junk in the results is a precision problem.", "exact"],
    [["16-bit precision", "8-bit precision", "4-bit precision", "lower precision", "full precision", "half precision", "reduced precision"],
     "How many bits are used to store each of the model's numbers. Fewer bits means a smaller, faster model and slightly rougher answers."],
    [["index", "indexing"], "The prepared data structure that makes search fast, and the process of building it."],
    ["dimensionality", "How many numbers are in each embedding — bigger can capture more nuance but costs more to store and search."],

    /* ---- RAG ---- */
    [["RAG", "retrieval-augmented generation", "retrieval augmented generation"], "Retrieval-Augmented Generation — look up relevant documents first, then paste them into the prompt so the model answers from real sources instead of memory."],
    [["chunking", "chunk", "chunks"], "Cutting long documents into passage-sized pieces so retrieval can return the relevant bit rather than a whole book."],
    ["overlap", "Repeating a little text between neighbouring chunks so a sentence split across the boundary is not lost."],
    [["retrieval", "retrieve"], "The step that fetches relevant material from your data before the model answers."],
    ["retriever", "The component that takes a question and returns the passages most likely to answer it."],
    [["grounding", "grounded"], "Tying the answer to supplied source text, so claims can be checked rather than trusted."],
    [["citation", "citations"], "Pointing at the exact source passage an answer came from, so a reader can verify it."],
    [["hybrid search", "hybrid retrieval", "hybrid"], "Running keyword search and meaning-based search together and merging the results, because each catches what the other misses."],
    [["reranking", "rerank", "reranker"], "A second, slower and smarter pass that reorders the first batch of search results so the best ones land at the top."],
    ["cross-encoder", "A model that reads the question and a candidate passage together to score relevance accurately — too slow for the whole corpus, ideal for reranking."],
    ["query expansion", "Rewriting or broadening the user's question (synonyms, sub-questions) before searching, to catch documents the original wording would miss."],
    ["query rewriting", "Turning a messy or context-dependent question into a clean standalone search query."],
    ["parent document retrieval", "Searching over small precise chunks but handing the model the larger surrounding passage, so it gets both accuracy and context."],
    ["GraphRAG", "Retrieval over a graph of linked entities rather than loose passages, which helps with questions that span many documents."],
    ["agentic RAG", "Letting the model decide when and what to search, and search again, instead of always retrieving exactly once."],
    ["relevance floor", "A minimum score below which a search result is thrown away rather than shown to the model, so weak matches cannot mislead it."],
    ["faithfulness", "Whether the answer actually follows from the sources it was given, rather than drifting into invention."],
    ["groundedness", "Whether every claim in the answer can be traced back to the retrieved material."],
    ["RAGAS", "A popular open-source toolkit for scoring RAG systems on things like faithfulness and answer relevance."],
    ["corpus", "The full body of documents your system can search."],

    /* ---- Agents ---- */
    [["agent", "agents"], "A language model put in a loop where it can choose actions, run tools and react to the results, instead of answering in one shot."],
    ["agent loop", "The repeating cycle at the heart of every agent: look at what is known, decide one next action, run it, observe the result, repeat."],
    [["agentic", "agentic AI"], "Describes systems where the model, not the programmer, decides what happens next at run time."],
    ["autonomy", "How much the system is allowed to decide for itself without a human confirming each step."],
    ["ReAct", "Reason + Act — the standard agent pattern of writing a short thought, taking one action, seeing the result, then thinking again."],
    ["plan-and-execute", "Have the model write the whole plan first, then carry out the steps — cheaper and more auditable than rethinking after every step."],
    [["reflection", "self-critique"], "Having the model review and criticise its own draft, then improve it, before anything is shown to the user."],
    [["tool", "tools", "tool calling", "function calling"], "A function your code exposes to the model — search, look up an order, send an email. The model asks for it by name; your code is what actually runs it."],
    ["tool schema", "The machine-readable description of a tool: its name, what it does, and exactly which arguments it accepts."],
    ["tool surface", "The full set of tools an agent can reach. The bigger it is, the more ways things can go wrong."],
    ["ReAct loop", "The think-act-observe cycle repeated until the agent can answer or hits a limit."],
    [["trajectory"], "The full sequence of steps an agent actually took on one run — the path, not just the destination."],
    [["scratchpad", "working memory"], "The running notes of the current task, kept in the prompt so the agent remembers what it has already tried."],
    ["short-term memory", "What the agent remembers within a single conversation or task — usually just the message history."],
    ["long-term memory", "Facts deliberately saved across sessions, so the agent still knows them tomorrow."],
    ["episodic memory", "Memory of specific past events or runs, as opposed to general facts."],
    ["state", "The data carried from one step to the next — in a graph or agent, the shared object every step reads and updates.", "exact"],
    [["compaction", "compact", "summarisation", "summarization"], "Shrinking a conversation that has grown too long, usually by replacing old turns with a summary, so it still fits the context window."],
    ["truncation", "Simply cutting off text that no longer fits, which is fast but loses whatever was cut."],
    ["token budget", "The deliberate allowance of tokens each part of the prompt is allowed to consume."],
    [["max steps", "step limit"], "A hard cap on how many loop iterations an agent may take, so a confused agent stops instead of spinning forever."],
    ["termination", "The conditions under which the loop ends: an answer, a limit, an error or an escalation."],
    [["oscillation", "loop detection"], "When an agent flips between the same two actions forever; detecting it lets you stop the run instead of burning money."],
    [["orchestration", "orchestrator"], "The layer that coordinates several models, tools or agents and decides who does what, in what order."],
    [["routing", "router"], "Sending each request to the right handler, model or specialist based on what it is."],
    [["handoff", "delegation", "delegate"], "One agent passing a task, plus the context needed to do it, to another agent."],
    ["supervisor", "A coordinating agent that breaks work up, hands pieces to specialists and assembles the result."],
    ["multi-agent", "Several cooperating agents, each with a narrow job, instead of one agent trying to do everything."],
    [["human in the loop", "HITL", "approval gate"], "Requiring a person to approve an action before the system carries it out — the standard safeguard for anything costly or irreversible."],
    ["escalation", "Handing the task to a human when the agent cannot finish it safely or confidently."],
    ["workflow", "A path through the work that you coded in advance, with fixed steps and branches. Cheaper and more predictable than an agent — use it whenever you can draw the flowchart."],
    [["chain", "chains"], "A fixed sequence of model or tool calls wired together, where the order never changes."],
    ["idempotency", "Designing an action so that doing it twice has the same effect as doing it once — how you stop a retry becoming a second refund."],
    ["idempotency key", "A unique id attached to an action so the receiving system can recognise and ignore a duplicate."],
    ["dry run", "Executing everything except the irreversible part, so you can inspect what would have happened."],
    ["audit log", "A durable, tamper-evident record of what the system did and why, kept for later inspection."],
    ["circuit breaker", "A switch that trips after repeated failures and stops further calls for a while, instead of hammering a broken service."],
    [["exponential backoff", "backoff"], "Waiting longer and longer between retries, so a struggling service is given room to recover."],
    [["retry", "retries"], "Automatically trying a failed call again — safe for reads, dangerous for actions that change things."],
    [["timeout", "timeouts"], "A deadline after which a call is abandoned, so one slow dependency cannot hang the whole run."],
    ["graceful degradation", "Falling back to a reduced but useful answer when part of the system fails, rather than failing outright."],

    /* ---- Protocols ---- */
    [["MCP", "Model Context Protocol"], "Model Context Protocol — a shared standard for how an AI application connects to tools and data, so a tool written once works with any compatible app."],
    [["MCP server", "MCP servers"], "A small service that exposes tools, data or prompt templates over MCP for any AI application to use."],
    ["MCP client", "The part of an AI application that speaks MCP to one server and relays its tools to the model."],
    ["host", "In MCP, the application the user actually interacts with: it owns the model and decides which servers and tools it may use.", "exact"],
    [["JSON-RPC", "JSON RPC"], "A simple convention for calling a function on another process by sending it a JSON message."],
    ["capability discovery", "The handshake where a client asks a server 'what can you do?' and gets back the list of available tools."],
    [["allowlist", "allow-list"], "An explicit list of what is permitted, with everything else blocked by default — safer than trying to list what is banned."],
    [["A2A", "Agent2Agent"], "Agent-to-Agent — an open protocol letting independent agents from different vendors discover each other and exchange tasks."],
    ["agent card", "A published description of what an agent can do, where to reach it and how to authenticate — how other agents discover it."],
    ["A2UI", "Agent-to-UI — protocols that let an agent send back real interface components (forms, buttons) rather than only text."],
    ["generative UI", "Interface elements produced on the fly by the model to suit the answer, instead of screens designed in advance."],
    [["artifact", "artifacts"], "A concrete output produced by a task — a file, a report, a chunk of structured data."],
    ["transport", "The channel messages travel over — local pipes, HTTP, or a streaming connection."],
    ["stateless", "Keeping no memory between requests, so each call carries everything it needs. Easier to scale and restart."],

    /* ---- Frameworks ---- */
    ["LangChain", "A widely used library of ready-made building blocks — model wrappers, retrievers, memory, tool adapters — for assembling LLM applications."],
    [["LCEL", "Runnable", "runnables"], "LangChain Expression Language — its way of piping components together with | so each piece can stream, batch and run in parallel for free."],
    ["LlamaIndex", "A framework focused on getting your documents and databases into a form a model can query well."],
    ["query engine", "LlamaIndex's ready-made ask-a-question-over-your-data component: it retrieves, assembles context and answers."],
    ["VectorStoreIndex", "LlamaIndex's standard index that embeds your documents and searches them by meaning."],
    [["node", "nodes"], "In LlamaIndex, a chunk of a document with its metadata. In LangGraph, one step of the graph — a function that updates the state."],
    ["LangGraph", "A framework for building agents as an explicit graph of steps, so you control the flow, can pause it, resume it and inspect it."],
    [["edge", "edges"], "A connection in a graph saying which step runs next."],
    ["conditional edge", "An edge that picks the next step at run time based on the current state — how a graph branches."],
    ["checkpointer", "LangGraph's saver that writes the state after every step, so a run can survive a crash, be resumed, or be rewound."],
    ["thread_id", "The identifier that ties saved state to one conversation, so resuming picks up the right history."],
    ["time-travel", "Rewinding a saved run to an earlier step and continuing from there with something changed."],
    ["reducer", "The rule saying how a node's output is merged into the shared state — replace it, or append to it."],
    ["TypedDict", "A plain Python dictionary with declared key names and types, commonly used for LangGraph state."],
    ["CrewAI", "A framework for setting up a small team of role-playing agents that collaborate on a task."],
    ["Pydantic", "The Python library that validates data against a declared shape, turning malformed input into a clear error instead of a mystery crash."],
    ["BaseModel", "The Pydantic class you subclass to declare a data shape with typed fields."],
    [["validator", "field validator", "model validator"], "A Pydantic hook that checks or cleans a value beyond simple type checking."],
    ["discriminated union", "A 'one of these shapes' type where a named field tells the parser which shape to expect."],
    [["schema", "schemas"], "A formal description of the shape data must take — which fields exist, of what type, and which are required."],

    /* ---- Async Python ---- */
    ["asyncio", "Python's toolkit for doing many waiting-heavy jobs (network calls, model requests) at once on a single thread."],
    ["event loop", "The scheduler at the heart of asyncio that keeps switching between tasks whenever one is waiting."],
    [["coroutine", "coroutines"], "An async function's paused-and-resumable body — it does nothing until you await it or schedule it."],
    ["await", "Pausing here until this result is ready, letting other work run in the meantime."],
    ["TaskGroup", "The modern way to run several async tasks together with the guarantee that none is left running if one fails."],
    ["asyncio.gather", "Run several async calls at once and wait for all their results."],
    ["semaphore", "A counter that caps how many things may run at once — how you stop yourself from overwhelming an API."],
    ["backpressure", "Deliberately slowing down producers when consumers cannot keep up, so nothing silently piles up or drops."],
    ["cancellation", "Stopping an in-flight async task cleanly, including whatever it was waiting on."],
    [["blocking", "blocking call"], "Code that stops the whole event loop while it waits — the classic way to make an async program mysteriously slow."],
    [["concurrency"], "Making progress on many jobs by interleaving them. Not the same as parallelism, which runs them at literally the same instant."],
    ["parallelism", "Genuinely doing several things at the same moment, on different cores or machines."],

    /* ---- Evaluation & production ---- */
    [["evaluation", "eval", "evals"], "Measuring whether the system is actually any good, with a repeatable test set instead of a gut feeling."],
    ["golden set", "A fixed set of example inputs with agreed correct answers, used to check that changes improve things rather than break them."],
    ["LLM-as-judge", "Using a second model, with a written scoring rubric, to grade the first model's answers at scale."],
    ["rubric", "The explicit written criteria a grader — human or model — must apply, so scores mean the same thing each time."],
    ["regression suite", "The set of tests you re-run before every release to catch things that used to work and no longer do."],
    ["offline evaluation", "Grading against a saved test set before shipping, rather than on live traffic."],
    ["online evaluation", "Measuring quality on real users' traffic once the system is live."],
    ["A/B test", "Showing two versions to different users at random to see which actually performs better."],
    ["adversarial testing", "Deliberately attacking your own system with the nastiest inputs you can imagine, before someone else does."],
    ["benchmark", "A standard public test set used to compare models — useful for a rough ranking, weak evidence about your specific task."],
    ["task success", "Whether the run achieved the user's actual goal — the outcome, regardless of the route taken."],
    ["tool-call correctness", "Whether the agent called the right tool with the right arguments at each step."],
    [["observability"], "Being able to tell what your system is doing and why, from the signals it emits, without attaching a debugger."],
    [["tracing", "trace", "traces"], "A recorded timeline of one run — every model call, tool call, input, output, timing and cost — so you can see exactly what happened."],
    ["stack trace", "The ordinary programming error report listing which lines of code led to a crash. Not the same thing as an agent trace."],
    [["span", "spans"], "One timed step inside a trace, such as a single model call or one tool invocation."],
    ["correlation id", "A single id threaded through every log and span of one request, so you can pull the whole story back together."],
    ["Langfuse", "An open-source platform for tracing LLM applications and tracking their cost, latency and quality scores."],
    ["LangSmith", "LangChain's hosted platform for tracing, testing and monitoring LLM applications."],
    ["LLMOps", "The operational discipline of running LLM systems in production: versioning prompts, testing, deploying, monitoring, controlling cost."],
    ["MLOps", "The same operational discipline for traditional machine-learning models."],
    ["model routing", "Sending easy requests to a small cheap model and hard ones to a large expensive model, to cut cost without hurting quality."],
    ["cost per run", "What one complete task costs in model tokens — the number that decides whether the feature can ship."],
    ["token accounting", "Tracking exactly where the tokens went, per step and per feature, so cost surprises are traceable."],
    ["rate limiting", "Capping how many requests a user or service may make in a period, to protect both cost and availability."],
    ["canary", "Releasing a change to a small slice of traffic first, so problems show up small."],
    ["drift", "Quality quietly degrading over time as real-world inputs, data or the underlying model change."],
    ["feedback loop", "Collecting real users' signals about answer quality and feeding them back into the test set and the prompts."],

    /* ---- Safety & security ---- */
    [["guardrail", "guardrails"], "Checks placed around the model — on what goes in and what comes out — that block unsafe, off-topic or malformed content."],
    [["prompt injection", "injection"], "An attack where text the model reads contains instructions, and the model obeys them as if they came from you."],
    ["indirect prompt injection", "Prompt injection hidden inside content the agent fetches — a web page, a document, a support ticket — rather than typed by the user."],
    ["retrieval poisoning", "Planting malicious content where your retrieval will find it, so the attacker's text ends up in the model's prompt."],
    ["jailbreak", "Wording crafted to talk a model out of its safety rules."],
    ["least privilege", "Giving each component only the permissions it genuinely needs, so a compromise stays small."],
    ["confused deputy", "When an attacker gets a trusted component to misuse its own privileges on their behalf."],
    ["exfiltration", "Data being smuggled out — for example an agent persuaded to put secrets into a URL it fetches."],
    ["trust boundary", "The line where data stops being yours and starts being someone else's, which is where validation belongs."],
    [["PII", "personally identifiable information"], "Personally Identifiable Information — data that can identify a real person, and therefore must be handled carefully by law."],
    ["redaction", "Stripping or masking sensitive values before text is stored, logged or sent to a model."],
    ["output validation", "Checking the model's answer against rules or a schema before anything acts on it."],
    ["sandboxing", "Running risky code or tools in a confined environment where they cannot touch anything that matters."],
    ["tenant isolation", "Making sure one customer's data can never surface in another customer's results."],
    ["red teaming", "Paying attention people to attack your system on purpose to find the failures before real attackers do."],

    /* ---- Misc engineering ---- */
    ["API", "A defined way for one program to call another over the network."],
    ["SDK", "A vendor's ready-made library that wraps their API so you write less plumbing."],
    ["endpoint", "A specific callable address of a service."],
    ["webhook", "The reverse of an API call: the service calls your URL when something happens, instead of you polling it."],
    ["idempotent", "Safe to repeat — running it twice leaves the same result as running it once."],
    ["Elasticsearch", "A search engine widely used for logs and documents, strong at keyword search and filtering."],
    ["Docker", "A way to package an application with everything it needs so it runs identically anywhere."],
    ["FastAPI", "A modern Python web framework, popular for serving models because it is async and validates requests with Pydantic."],
    ["WebSocket", "A connection that stays open in both directions, used for live streaming between browser and server."],
    ["Gradio", "A Python library for wrapping a model in a quick web demo UI."],
    ["Streamlit", "A Python library for turning a script into a shareable web app, common for prototypes."]
  ];

  /* ---------------------------------------------------------------------
     Build a lookup + one combined matcher.
     Longest terms first so "context window" wins over "context", and
     "prompt injection" wins over "prompt".
     --------------------------------------------------------------------- */
  var DEFS = Object.create(null);   // lowercased term -> definition
  var EXACT = Object.create(null);  // lowercased term -> no automatic plural
  var PHRASES = [];

  GLOSSARY.forEach(function (row) {
    var names = Array.isArray(row[0]) ? row[0] : [row[0]];
    var def = row[1];
    var exact = row[2] === "exact";
    names.forEach(function (n) {
      var k = n.toLowerCase();
      if (DEFS[k]) return;          // first definition wins
      DEFS[k] = def;
      if (exact) EXACT[k] = 1;
      PHRASES.push(n);
    });
  });

  PHRASES.sort(function (a, b) { return b.length - a.length; });

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // A term may appear with a trailing plural "s" that is not itself listed
  // (token -> tokens). Allowing it here keeps the glossary short without
  // matching half-words: the boundaries below still require a real break.
  // Entries flagged "exact" opt out, because their plural is a common verb.
  var body = PHRASES.map(function (p) {
    var plural = /[a-z]$/.test(p) && !/s$/.test(p) && !EXACT[p.toLowerCase()];
    return esc(p) + (plural ? "s?" : "");
  }).join("|");

  // Boundaries are hand-rolled rather than \b because many terms end in a
  // non-word character (top-p, tok/s, A/B test) where \b behaves backwards.
  var RE = new RegExp("(^|[^A-Za-z0-9_'\\-])(" + body + ")(?![A-Za-z0-9_'\\-])", "gi");

  /* ---------------------------------------------------------------------
     Where we are allowed to annotate.
     --------------------------------------------------------------------- */
  var SKIP_TAGS = {
    PRE: 1, CODE: 1, KBD: 1, SAMP: 1, SCRIPT: 1, STYLE: 1, TEXTAREA: 1,
    A: 1, BUTTON: 1, INPUT: 1, SELECT: 1, OPTION: 1, LABEL: 1, SUMMARY: 1,
    H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, NAV: 1, ASIDE: 1, DIALOG: 1
  };
  var SKIP_CLASS = /\b(?:jargon|term-link|toc|sidebar|eyebrow|meta-row|pill|crumbs|page-nav|search|quiz-opts|no-jargon|term-dialog)\b/;

  // Once per concept per page. These marks are now full `.term-link` buttons —
  // accent-coloured with a ⓘ — which is a much louder mark than a dotted
  // underline, so a second copy of the same word is noise, not help.
  var MAX_PER_TERM = 1;

  function skippable(el) {
    while (el && el.nodeType === 1) {
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.className && typeof el.className === "string" && SKIP_CLASS.test(el.className)) return true;
      if (el.hasAttribute && el.hasAttribute("data-no-jargon")) return true;
      el = el.parentNode;
    }
    return false;
  }

  function annotate(root) {
    var seen = Object.create(null);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
        if (skippable(n.parentNode)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var texts = [], t;
    while ((t = walker.nextNode())) texts.push(t);

    texts.forEach(function (node) {
      var text = node.nodeValue;
      RE.lastIndex = 0;
      if (!RE.test(text)) return;
      RE.lastIndex = 0;

      var frag = document.createDocumentFragment();
      var last = 0, m, touched = false;

      while ((m = RE.exec(text))) {
        var lead = m[1] || "";
        var word = m[2];
        var key = word.toLowerCase();
        var def = DEFS[key] || DEFS[key.replace(/s$/, "")];
        if (!def) continue;
        // Count against the DEFINITION, not the spelling, so "tool", "tools"
        // and "tool calling" share one budget instead of three.
        if ((seen[def] || 0) >= MAX_PER_TERM) continue;
        seen[def] = (seen[def] || 0) + 1;

        var start = m.index + lead.length;
        if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));

        // A real <button>, not a span with role="button": it is focusable,
        // Enter/Space-activatable and announced correctly without any extra
        // wiring, and `.term-link` is the existing style for exactly this.
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "term-link jargon";
        btn.setAttribute("data-def", def);
        btn.setAttribute("aria-label", word + " — what this means");
        btn.textContent = word;
        frag.appendChild(btn);

        last = start + word.length;
        touched = true;
      }

      if (!touched) return;
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ---------------------------------------------------------------------
     One shared modal, matching the hand-written term dialogs already in the
     prose. A native <dialog> gives us the backdrop, Esc to close, the focus
     trap and top-layer stacking for free — no z-index bookkeeping, and it
     renders correctly above the focused reading canvas.

     One dialog reused for every term, rather than one per word: a page marks
     dozens of terms, and dozens of hidden dialogs in the DOM would bloat every
     page for no benefit.
     --------------------------------------------------------------------- */
  var dlg = null, opener = null;

  function modal() {
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "term-dialog jargon-dialog";
    dlg.innerHTML =
      '<div class="term-dialog-head">' +
        '<div>' +
          '<span class="term-dialog-eyebrow">In plain English</span>' +
          '<h2></h2>' +
        '</div>' +
        '<button class="term-dialog-close" type="button" data-term-close aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="term-dialog-body"><p></p></div>';
    document.body.appendChild(dlg);

    dlg.querySelector("[data-term-close]").addEventListener("click", close);

    // A click on the backdrop lands on the dialog element itself, never on a
    // child, so comparing the target is enough to tell the two apart.
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });

    // Returning focus to the word keeps the reader's place, for keyboard and
    // screen-reader users alike.
    dlg.addEventListener("close", function () {
      if (opener) { try { opener.focus(); } catch (e) {} }
      opener = null;
    });
    return dlg;
  }

  function open(el) {
    var d = modal();
    opener = el;
    // The visible word, capitalised, reads better as a dialog title than the
    // raw match ("rag" -> "Rag" is wrong, so only the first letter is lifted
    // when the term is not already capitalised or an acronym).
    var word = el.textContent;
    var title = /^[a-z]/.test(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    d.querySelector("h2").textContent = title;
    d.querySelector(".term-dialog-body p").textContent = el.getAttribute("data-def") || "";
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");   // very old browsers: still readable
  }

  function close() {
    if (!dlg) return;
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else dlg.removeAttribute("open");
  }

  function wire(root) {
    // Delegated, so it keeps working if anything re-renders part of the page.
    // Click is the ONLY trigger: it is identical on desktop and on a phone,
    // and a <button> already turns Enter and Space into a click for us.
    root.addEventListener("click", function (e) {
      var el = e.target.closest && e.target.closest("button.jargon");
      if (!el) return;
      e.preventDefault();
      open(el);
    });
  }

  function init() {
    var root = document.querySelector("main.content");
    if (!root) return;
    try { annotate(root); } catch (err) { return; }
    wire(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
