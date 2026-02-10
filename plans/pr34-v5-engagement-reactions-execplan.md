# PR34 ExecPlan: Engagement Reactions (Thread + Reply Likes)

## Summary
Ship a larger engagement-focused slice by adding persistent likes to both thread starter posts and replies. This PR introduces DB-backed reactions, RLS-safe write paths, and visible like counts/actions in thread detail and discovery surfaces.

## Goals
- Increase participation and feedback loops with low-friction reactions.
- Surface lightweight social proof (like counts) in core reading flows.
- Keep authorization/RLS-first safety and route stability.

## Non-goals
- No follow/unfollow system.
- No reaction notifications.
- No unlike action.
- No multi-emoji reaction types.
- No changes to existing auth redirect contracts/routes.

## Assumptions and open questions
- Keep only one reaction type (`like`) in PR34.
- Reactions are one-way in PR34 (`Like` then `Liked` disabled state).
- Self-likes are disallowed at DB policy level.
- Open questions: none blocking.

## User journeys
1. Signed-in user opens a thread and likes the starter post once.
2. Signed-in user likes selected replies and sees counts update.
3. Signed-out visitor sees like counts and is prompted to log in to like.
4. Discovery pages surface thread like counts to highlight social proof.

## Interfaces and data model
- New table: `public.reactions`
  - `id`, `author_id`, `target_type`, `thread_id`, `reply_id`, `kind`, `created_at`
  - target and uniqueness constraints for one-like-per-user-per-target
- New server DB helpers in `web/src/lib/db/reactions.ts`
  - `likeThread`
  - `likeReply`
  - `getThreadLikeCount`
  - `getThreadLikeCounts`
  - `getReplyLikeCounts`
  - `getMyLikedTargets`
- Existing routes unchanged:
  - `/forum`
  - `/forum/category/[slug]`
  - `/forum/[threadId]`

## Authorization/RLS policy plan
- `select`: public read
- `insert`: `auth.uid() = author_id` plus self-like prohibition
- `update`: none
- `delete`: none
- Self-like check enforced in DB policy using target ownership lookup against `posts`/`replies`.

## Step-by-step implementation plan
1. Add this PR34 plan doc.
2. Add migration for `reactions` table, constraints, indexes, and RLS policies.
3. Add reaction DB access layer (`reactions.ts`) with normalized insert/count helpers.
4. Extend write error normalization for reaction-specific cases.
5. Integrate like actions and counts on `/forum/[threadId]` for thread and replies.
6. Integrate thread like-count pills in discovery list rows.
7. Fetch and pass like counts from `/forum` and `/forum/category/[slug]`.
8. Add UI styling for reaction controls and count pills.
9. Add targeted Playwright e2e coverage (`tests/e2e/reactions.spec.ts`).
10. Update docs (`SPEC.md`, `README.md`, `web/README.md`, `web/docs/testing-manual.md`) and migration pointers.
11. Run verification: lint, build, targeted e2e, full e2e.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase:
  - Apply PR34 migration in SQL Editor after existing migration chain.
- Vercel:
  - Validate like interactions and discovery counts in preview deployment.
- Repo A:
  - Unchanged.

## Acceptance criteria
1. Users can like thread starters and replies once (no duplicate likes).
2. Self-likes are blocked by DB/RLS protections.
3. Signed-out users see counts and login CTA to like.
4. Discovery surfaces display thread like counts.
5. No schema/policy side effects outside reactions scope.
6. Lint/build/targeted e2e pass; full e2e run is reported.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e -- tests/e2e/reactions.spec.ts`
  - `npm run test:e2e`
- Manual:
  - Like thread/reply once as signed-in user.
  - Confirm `Liked` disabled state on already-liked items.
  - Confirm self-like rejection path.
  - Confirm guest login CTA for like actions.
  - Confirm like counts on discovery rows.

## Risks and mitigations
- Risk: one-way like model may surprise users expecting unlike.
  - Mitigation: explicit `Liked` disabled label.
- Risk: self-like bypass if only UI-enforced.
  - Mitigation: DB policy-level ownership checks.
- Risk: additional query overhead for counts.
  - Mitigation: indexed reaction target columns and batched count lookups.

## Rollback/backout approach
- Revert PR34 UI/docs code changes.
- Apply rollback SQL migration dropping `reactions` objects if needed.
- Existing routes/features remain intact.

## Decision log
- Scope: reactions only (no follows).
- Targets: threads and replies.
- Interaction: one-way like only (no unlike).
- Notifications: none for likes in PR34.
- Self-likes: disallowed.
