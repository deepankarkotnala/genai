# Mobile Navigation and SQL Interview Prep Update

## Mobile navigation refresh

- Added a contextual mobile drawer header that highlights the current learning path.
- Added a dedicated close control and improved drawer accessibility behavior.
- Added short descriptions beneath every navigation group on mobile.
- Restyled navigation groups as glass cards with distinct color accents, clearer active states and improved spacing.
- Added a blurred backdrop and restrained entrance motion, with reduced-motion support.
- Kept the desktop sidebar behavior unchanged.

## SQL interview preparation

- Added `genai-portal/interview-prep/09-sql-for-genai.html`.
- Added 12 GenAI-role-focused SQL questions covering joins, window functions, deduplication, CTEs, top-N queries, indexing, query plans, transactions, JSONB, pgvector, tenant isolation, safe text-to-SQL and generated-query evaluation.
- Added SQL to the shared site navigation and cross-site search registry.
- Updated the interview-prep overview to 107 questions across 10 topic maps.
- Connected the topic sequence to the existing secure text-to-SQL scenario.

## Validation

- JavaScript syntax checks pass for all portal asset scripts.
- CSS brace validation passes.
- All links and assets in the changed interview-prep pages resolve.
- The two pre-existing lesson references to `EnM Agents.xlsx` and `enm_dump.txt` remain unresolved because those files are not part of the source project.
