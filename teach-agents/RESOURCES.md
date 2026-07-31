# AI Agents — Resources

Curated, high-trust sources. Knowledge for lessons is drawn from here, not from guesses.

## Knowledge

- [Anthropic — "Building Effective Agents"](https://www.anthropic.com/engineering/building-effective-agents)
  The best short primer from people who build agents at scale. Use for: what an agent is,
  workflows vs. agents, orchestration patterns. **Primary source for Lessons 1–2.**

- [Anthropic — "Effective context engineering for AI agents"](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  Use for: managing the context window, why agents drift over long loops. (Later lessons.)

- [OpenAI — "A practical guide to building agents" (PDF)](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
  Vendor-neutral enough; good on tools, guardrails, orchestration. Use for: a second perspective.

- [Google AI Studio — free Gemini API keys](https://aistudio.google.com/apikey)
  Use for: the free LLM that powers the first agent. No card required.

- [Google — Gemini function calling docs](https://ai.google.dev/gemini-api/docs/function-calling)
  Use for: turning the toy tool registry into real LLM tool/function calling.

## Wisdom (Communities)

- [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/) — high-signal on running models for free/locally.
  Use for: free model choices, hardware questions.
- [r/AI_Agents](https://www.reddit.com/r/AI_Agents/) — practitioners building agents.
  Use for: real-world patterns, "is this a good design?" gut checks.

## Gaps
- Public, vendor-neutral material on **agent evaluation** is still thin: most of what exists is
  either a framework's own documentation or a vendor benchmark. For lesson 10 we reason from
  first principles plus the general sources above, and treat trajectory evaluation as the part
  you will have to design yourself.
- Same for **irreversible actions and approval design** (lesson 8). The patterns come from
  ordinary payments and workflow engineering rather than from anything agent-specific — which is
  itself the useful insight.
