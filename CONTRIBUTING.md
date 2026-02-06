# Contributing

## Branching and PR Strategy
- Keep one logical change per branch/PR.
- Suggested naming:
  - `docs/pr0-baseline`
  - `feat/pr1-scaffold`
  - `feat/pr2-auth`

## PR Checklist
- Scope is clear and limited.
- Acceptance criteria reference included (from `plans/*.md`).
- Verification steps are documented and reproducible.
- No secrets or environment values committed.
- Docs updated when behavior or process changes.

## Local Validation
- Run project checks for the current stage (build/lint/tests when configured).
- Manually test auth and protected flows for security-sensitive changes.

## Documentation Requirements
- Update `SPEC.md` if feature scope changes.
- Add/update ExecPlan in `plans/` for substantial work.
- Update `SECURITY.md` when auth/RLS/secret handling changes.

## Review Guidance
- Prioritize correctness and safety over polish.
- Explicitly call out RLS and auth assumptions.
- Keep feedback actionable and tied to acceptance criteria.
