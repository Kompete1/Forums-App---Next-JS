# Planning Standard

## Purpose
Define how execution plans are written so implementation can be handed off without unresolved decisions.

## When to Create an ExecPlan
- Any task spanning multiple files or systems.
- Any task involving Supabase schema/RLS/auth changes.
- Any task with deployment or environment implications.

## ExecPlan Location
- Store plans in `plans/`.
- Naming convention: `plans/<scope>-execplan.md` (example: `plans/v0-execplan.md`).

## ExecPlan Template
Use this structure:

1. Title
2. Summary
3. Goals
4. Non-goals
5. Assumptions and open questions
6. User journeys
7. Interfaces and data model
8. Authorization/RLS policy plan
9. Step-by-step implementation plan
10. Manual platform steps (Supabase/Vercel/Repo A)
11. Acceptance criteria
12. Verification steps
13. Risks and mitigations
14. Rollback/backout approach (if applicable)

## Decision Log Rules
- Document important tradeoffs and chosen defaults.
- Keep unresolved questions minimal and high-impact only.
- If a decision is deferred, record explicit trigger for revisiting it.

## Definition of Ready
- Scope boundaries are clear.
- Dependencies and external systems are identified.
- Acceptance criteria are concrete and testable.

## Definition of Done
- All acceptance criteria pass.
- Verification steps executed and documented.
- Docs updated if behavior/flows changed.
- Security checks for secrets and policy changes completed.

## Documentation Sync Requirements
- Each feature PR must add one new `plans/<pr>-execplan.md`.
- Each feature PR must update `SPEC.md` milestone/status text.
- Each feature PR must update at least one verification doc:
  - `web/README.md`
  - `web/docs/testing-manual.md`
- A PR is not done unless docs state:
  - what changed
  - how it was verified
  - what remains pending
