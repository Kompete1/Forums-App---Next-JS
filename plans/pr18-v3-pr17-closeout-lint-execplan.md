# PR18 ExecPlan: PR17 Closeout and Lint Reliability

## Summary
Close out PR17 by fixing the lint regression so baseline verification commands are fully green, and update milestone docs to reflect PR17 completion before starting attachments.

## Goals
- Restore `npm run lint` reliability from a clean checkout.
- Keep `npm run build` and `npm run test:e2e` passing.
- Update status docs from "PR17 in progress" to "PR17 completed".
- Keep scope small, single-purpose, and low-risk.

## Non-goals
- No new product features.
- No Supabase schema, trigger, or RLS changes.
- No attachments/storage or admin dashboard implementation.

## Assumptions and open questions
- Assumption: notifications feature code shipped in PR17 is complete enough for closeout.
- Assumption: dual-user notifications e2e remains optional when `E2E_ALT_*` credentials are absent.
- Open question: none blocking this PR.

## User journeys
- Contributor can run `npm run lint` in `web/` on a clean clone without local Playwright output folders and get a successful run.
- Maintainer can read root/web docs and immediately understand PR17 is complete and the next slice is attachments.

## Interfaces and data model
- No public API/interface/type changes.
- Tooling-only change:
  - `web/eslint.config.mjs` ignores generated test artifact folders:
    - `test-results/**`
    - `playwright-report/**`
    - `coverage/**`

## Authorization/RLS policy plan
- No policy changes.
- Existing notifications/report/roles policies remain unchanged.

## Step-by-step implementation plan
1. Add this PR18 ExecPlan file in `plans/`.
2. Update `web/eslint.config.mjs` to ignore generated test artifact directories.
3. Update status/docs:
   - `README.md` milestone and latest ExecPlan pointer.
   - `web/README.md` active build and roadmap wording.
   - `SPEC.md` V3 implementation status from in-progress to completed for PR17.
4. Run verification in `web/`:
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e`
5. Capture verification outcomes and residual skips in PR notes.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: none required beyond normal preview checks.
- Repo A: no changes.

## Acceptance criteria
1. `npm run lint` passes from `web/` without requiring `test-results/` to exist.
2. `npm run build` passes from `web/`.
3. `npm run test:e2e` passes from `web/`, allowing documented skip for dual-user notifications test when alt credentials are missing.
4. `README.md`, `web/README.md`, and `SPEC.md` show PR17 as completed and point next to attachments/admin dashboard work.

## Verification steps
- Local commands in `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual sanity checks in preview after PR creation:
  - `/forum`
  - `/notifications`
  - `/health`

## Risks and mitigations
- Risk: over-broad ignores could hide real source issues.
- Mitigation: only ignore known generated folders (`test-results`, `playwright-report`, `coverage`).

## Rollback/backout approach
- Revert this PR.
- Restore previous `web/eslint.config.mjs`.
- Revert status docs if roadmap wording was not desired.

## PR Notes Template
- What changed:
  - ESLint ignore fix for generated test artifact directories.
  - Status doc updates marking PR17 complete.
- Why it changed:
  - `npm run lint` failed on clean environments due to missing generated output directories.
- How it was verified:
  - `npm run lint`, `npm run build`, `npm run test:e2e`.
- Risks and follow-up:
  - Minimal tooling-only risk.
  - Follow-up branch after merge: `feat/pr19-v3-attachments-storage`.
