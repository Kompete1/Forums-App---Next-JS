# PR27 ExecPlan: UX Redesign Foundations and Incremental Delivery

## Summary
Deliver the forum UX redesign in small, reviewable slices while preserving current Supabase RLS/security boundaries and stable route structure.

## Goals
- Fix auth redirect and return-to behavior for login, create-thread, and reply journeys.
- Improve signed-in state clarity with avatar menu navigation.
- Improve forum/category thread list readability.
- Reflow thread detail so reading/replying are primary, reporting is secondary.
- Sort threads by last activity and bump on reply.

## Non-goals
- No rich text editor rollout in this slice.
- No policy model rewrite.
- No route IA rewrite.

## Assumptions and open questions
- `returnTo` supersedes `next`, with temporary backwards compatibility.
- DB change for `last_activity_at` remains additive and policy-neutral.
- Open question: none blocking.

## User journeys
1. Direct login redirects to `/forum`.
2. Guest clicks create-thread CTA -> login -> returns to create-thread destination.
3. Guest clicks reply CTA on thread -> login -> returns to thread with composer anchor.
4. Signed-in user sees avatar menu and can access profile/logout quickly.
5. Replying on an older thread bumps that thread to top in discovery lists.

## Interfaces and data model
- Login query param: `returnTo` (safe internal-only), with `next` fallback.
- Header interface adds avatar menu and explicit new-thread CTA.
- Add `posts.last_activity_at` and update ordering behavior for discovery queries.

## Authorization/RLS policy plan
- Preserve all current policies.
- No broad policy rewrites.
- Additive trigger updates post metadata only.

## Step-by-step implementation plan
1. PR1 docs + token contract.
2. PR2 auth returnTo + header avatar foundation + dropdown/dialog primitives.
3. PR3 thread/category readability refresh.
4. PR4 thread detail reflow and modal report UX.
5. PR5 `last_activity_at` migration + discovery ordering.
6. PR6 notification/newsletter consistency pass.
7. PR7 test expansion and docs closeout.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase:
  - Apply migration for `last_activity_at` when PR5 lands.
  - Run verification SQL.
- Vercel:
  - Validate redirect and sorting behavior in preview.
- Repo A:
  - Unchanged.

## Acceptance criteria
1. `/auth/login` direct sign-in lands on `/forum`.
2. Create/reply auth interruptions preserve destination.
3. Header signed-in state is clearly visible via avatar/menu.
4. Report actions are modal/secondary UX.
5. Thread discovery defaults to last activity and bumps on reply.
6. Lint/build/e2e checks pass.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual checks from `web/docs/testing-manual.md`.

## Risks and mitigations
- Risk: auth redirect regressions.
  - Mitigation: targeted Playwright coverage and safe-path validation.
- Risk: migration/order regressions.
  - Mitigation: compatibility fallback to created_at sorting and SQL verification.

## Rollback/backout approach
- Revert code PRs independently.
- Keep additive DB column safely unused if code rollback is needed.
