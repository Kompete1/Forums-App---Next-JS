# PR15 ExecPlan: V2 Anti-Spam / Rate-Limit Basics

## 1. Title
V2 PR15 Anti-Spam / Rate-Limit Basics

## 2. Summary
Add database-enforced cooldowns and burst limits for thread creation, replies, and reports. Keep authorization in Supabase/Postgres and surface clear, actionable error messages in forum UI flows.

## 3. Goals
- Enforce anti-spam protections at DB level for posts/replies/reports.
- Preserve all existing auth and RLS ownership/moderation behavior.
- Show specific inline feedback when user is rate-limited.

## 4. Non-goals
- CAPTCHA or challenge systems.
- IP/device fingerprinting.
- Advanced abuse scoring.
- Hide/remove moderation workflow.

## 5. Assumptions and Open Questions
- Assumption: no role exemptions in this PR; admin/mod are also subject to cooldowns.
- Assumption: DB server time (`now()`) is source of truth for cooldown windows.
- Assumption: existing duplicate-report unique constraints remain unchanged and active.
- Open question deferred: whether future versions should include role-based cooldown overrides.

## 6. User Journeys
1. Signed-in user creates a thread and then immediately tries again; second create is blocked with thread cooldown message.
2. Signed-in user posts a reply and retries too quickly; second reply is blocked with reply cooldown message.
3. Signed-in user reports content and retries too quickly; second report is blocked with report cooldown message.
4. Signed-in user exceeds 10 reports in 15 minutes; additional reports are blocked with burst-limit message.

## 7. Interfaces and Data Model
- New migration: `web/supabase/migrations/20260208_pr15_v2_anti_spam_rate_limit.sql`.
- New DB trigger functions:
  - `public.enforce_posts_rate_limit()`
  - `public.enforce_replies_rate_limit()`
  - `public.enforce_reports_rate_limit()`
- New trigger attachments:
  - `before insert on public.posts`
  - `before insert on public.replies`
  - `before insert on public.reports`
- New helper module: `web/src/lib/db/write-errors.ts` with normalized codes:
  - `THREAD_COOLDOWN`
  - `REPLY_COOLDOWN`
  - `REPORT_COOLDOWN`
  - `REPORT_BURST_LIMIT`
  - `UNKNOWN_WRITE_ERROR`

## 8. Authorization/RLS Policy Plan
- No new RLS policies in PR15.
- Existing RLS remains source of truth.
- Anti-spam protections are additive trigger checks applied before insert.

## 9. Step-by-step Implementation Plan
1. Add PR15 migration with indexes, trigger functions, and idempotent trigger creation.
2. Add write-error normalization helper for DB token parsing.
3. Update `createThread`, `createReply`, `createReport` error handling to map DB errors.
4. Update `/forum/new` and `/forum/[threadId]` server actions to return specific inline errors.
5. Update `web/README.md` migration order and manual anti-spam verification.
6. Validate with lint/build.

## 10. Manual Platform Steps (Supabase/Vercel/Repo A)
1. Apply PR15 migration in Supabase SQL Editor after PR13 migration.
2. Verify trigger functions and triggers exist on `posts`, `replies`, and `reports`.
3. Verify cooldown/burst behavior with signed-in test user.
4. No Repo A changes required.

## 11. Acceptance Criteria
1. `npm run lint` passes in `web/`.
2. `npm run build` passes in `web/`.
3. Thread create cooldown blocks immediate repeat for same author.
4. Reply create cooldown blocks immediate repeat for same author.
5. Report cooldown and burst cap both block excessive reporting.
6. Existing moderation/reporting/auth flows continue to work.

## 12. Verification Steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
- Manual checks:
  - Thread cooldown: create thread twice quickly.
  - Reply cooldown: create reply twice quickly.
  - Report cooldown: submit report twice quickly.
  - Report burst: submit more than 10 reports in 15 minutes.
  - Duplicate report constraint still rejects same reporter+target duplicates.

## 13. Risks and Mitigations
- Risk: trigger false positives block legitimate activity.
  - Mitigation: conservative cooldown values and explicit user-facing messages.
- Risk: performance impact from recent-action lookups.
  - Mitigation: add `(actor_id, created_at desc)` indexes per table.
- Risk: hidden failures due to generic UI errors.
  - Mitigation: normalize DB errors and show explicit inline feedback.

## 14. Rollback/Backout Approach
- Revert app-layer error message changes if needed.
- If DB protections need rollback, apply follow-up migration that drops PR15 triggers/functions while preserving existing RLS and constraints.
