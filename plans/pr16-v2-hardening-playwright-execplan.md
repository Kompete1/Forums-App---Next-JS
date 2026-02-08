# PR16 ExecPlan: V2 Hardening Bundle (UX + Validation + Playwright Baseline)

## Summary
Deliver a stabilization bundle before V3 by adding e2e smoke automation, shared flash-message handling for write feedback, and reproducible manual/SQL verification assets.

## Goals
- Reduce regressions in thread/reply/report write paths.
- Standardize route-level feedback handling for write errors.
- Make manual checks explicit for role-sensitive and long-window validations.

## Scope
- Playwright baseline config and core e2e specs.
- Shared flash-message utilities used by `/forum/new` and `/forum/[threadId]`.
- SQL verification script for PR15 anti-spam objects.
- Manual testing guide and PR description testing addendum.

## Non-goals
- New V3 feature development.
- RLS policy redesign.
- Reintroducing deferred hide/remove moderation.

## Acceptance Criteria
1. `npm run lint` passes in `web/`.
2. `npm run build` passes in `web/`.
3. `npm run test:e2e` runs successfully (auth tests may skip without env credentials).
4. `/forum/new` and `/forum/[threadId]` use shared flash-message helper logic.
5. `web/supabase/verification/pr15_rate_limit_checks.sql` exists and returns expected rows in Supabase.
6. `web/docs/testing-manual.md` documents non-automated checks clearly.

## Verification
- Local:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Supabase dashboard:
  - Run `web/supabase/verification/pr15_rate_limit_checks.sql`.
- Manual:
  - Follow `web/docs/testing-manual.md` for moderator/report-burst/owner-boundary checks.
