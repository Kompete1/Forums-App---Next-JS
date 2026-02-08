# PR24 ExecPlan: Production Hardening Pack

## Summary
Deliver a focused hardening slice: operational checks, security headers, logging hygiene, and documented runbooks.

## Goals
- Raise production reliability and safety baseline.
- Add explicit security/runtime guardrails.
- Make operational verification reproducible.

## Non-goals
- No large feature additions.
- No redesign of core forum IA.

## Assumptions and open questions
- Assumption: hardening can be phased without downtime.
- Assumption: existing feature flows remain unchanged.
- Assumption: frame-restriction headers are deferred to keep Repo A iframe compatibility viable.
- Open question: none blocking.

## User journeys
1. Maintainer can verify deploy safety with clear pre/post-release checklist.
2. Operators can follow backup/restore and incident basics from docs.
3. Users get safer default security posture in production responses.

## Interfaces and data model
- Potential config updates (e.g., headers in `web/next.config.ts`).
- No major schema changes expected.
- Documentation additions for runbook and retention policy guidance.

## Authorization/RLS policy plan
- No policy model changes expected.
- Security review checklist applied to all sensitive paths.

## Step-by-step implementation plan
1. Add and validate baseline security headers.
2. Standardize server-side error logging boundaries (no sensitive token logging).
3. Expand hardening and operational docs:
   - backup/restore habit
   - retention/privacy notes
   - CI and deployment checks
4. Expand manual and automated verification checklist for high-risk flows.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: backup/restore walkthrough documentation and checks.
- Vercel: preview header verification and production rollout checks.
- Repo A: unchanged.

## Acceptance criteria
1. Security/runtime hardening items are documented and implemented.
2. No secret or token leakage patterns are introduced.
3. Verification and operational runbooks are reproducible.
4. Baseline commands pass after hardening updates.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - security header checks
  - backup/restore dry run
  - role-gated route regression checks.

## Risks and mitigations
- Risk: hardening config may unintentionally block runtime behavior.
- Mitigation: preview-first validation and explicit rollback checklist.

## Rollback/backout approach
- Revert hardening config/doc commits and redeploy known-good version.
