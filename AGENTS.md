# AGENTS

## Purpose
This file defines how Codex and contributors should operate in Repo B (Playground Forums) to keep changes safe, reviewable, and aligned with learning goals.

## Scope
- Repo B only: Next.js forums mini-app, docs, SQL migrations, and tests.
- Repo A (GitHub Pages hub) is separate and must be changed in a separate PR/repo unless explicitly requested.

## Non-Negotiables
- Never commit secrets. Use `.env.local` locally and platform env vars in Vercel/Supabase.
- Keep PRs small and single-purpose.
- Prefer dashboard-first instructions for Supabase/Vercel, with CLI alternatives optional.
- Preserve reproducibility: all required steps must be documented.

## Working Rules for Codex
- Before major edits, inspect current repo state and existing conventions.
- For large tasks, update `plans/*.md` first, then implement.
- If requirements conflict, prioritize `SPEC.md` and accepted ExecPlans.
- Call out assumptions explicitly in PR descriptions and plan docs.

## PR Policy
- `PR0`: docs-only planning baseline.
- `PR1+`: one logical chunk per PR (scaffold, auth, data model, etc.).
- Each PR should include:
  - What changed
  - Why it changed
  - How it was verified
  - Risks and follow-up

## Test and Verification Expectations
- Minimum for feature PRs:
  - Build passes
  - Lint/type checks pass (when configured)
  - Acceptance checks from relevant ExecPlan are validated
- Document manual verification clicks for auth and RLS-sensitive flows.

## Security and Data Handling
- Use least privilege and RLS by default.
- Keep personally identifiable data minimal.
- Do not log sensitive auth/session tokens.
- Document any policy changes in `SECURITY.md` and relevant plan docs.

## Documentation Ownership
- `SPEC.md`: product intent and acceptance criteria.
- `PLANS.md`: planning process and ExecPlan template.
- `plans/*.md`: task-level decision-complete execution plans.
- `docs/ARCHITECTURE.md`: system boundaries and flow.
