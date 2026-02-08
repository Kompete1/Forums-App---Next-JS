# Manual Testing Guide

This file lists checks that are still manual (not fully automated in e2e).

## Pre-check
1. Start app from `web/`:
   - `npm install`
   - `npm run dev`
2. Confirm app opens at `http://localhost:3000`.

## Manual-only checks

### 1) Moderator-only flows
1. Sign in as user with `mod` or `admin` role.
2. Open `/forum/<threadId>` and click `Lock thread`.
3. Confirm status changes to `Locked` and reply form is hidden.
4. Click `Unlock thread` and confirm status returns to `Open`.
5. Sign in as non-mod user and confirm lock/unlock controls do not appear.

### 2) Reports moderation visibility
1. Sign in as regular user and submit a report.
2. Sign in as mod/admin and open `/moderation/reports`; confirm report appears.
3. Sign in as non-mod and open `/moderation/reports`; confirm access denied.

### 3) Report burst limit (>10 in 15 min)
1. Sign in as one regular user.
2. Submit reports repeatedly across available thread/reply targets.
3. After 10 reports in 15 minutes, confirm message: report limit reached.

### 4) Cross-user owner boundaries
1. User A creates thread/reply/newsletter.
2. User B attempts update/delete for User A content.
3. Confirm rejection by RLS.

### 5) Notifications and realtime checks
1. Sign in as User A and create a thread.
2. Sign out, sign in as User B, and reply to User A thread.
3. Sign in as User A and open `/notifications`.
4. Confirm notification text indicates another user replied.
5. Keep `/notifications` open in one tab.
6. In another tab/session as User B, trigger another reply/report event.
7. Confirm User A inbox refreshes and new notification appears without manual reload.
8. Use `Mark read` and `Mark all as read`; confirm unread items clear.
9. Verify User A cannot read/modify User B notifications.

### 6) Forum UX polish checks (PR19)
1. Open `/forum` on desktop and mobile widths.
2. Confirm filter/search state is clearly visible and easy to reset.
3. Confirm create-thread CTA remains discoverable in both breakpoints.
4. Open `/forum/[threadId]` and confirm thread/replies/report controls remain visible and readable.
5. Confirm no owner/mod controls disappeared after UI polish.

### 7) Newsletter discussion bridge checks (PR20 active)
1. Open `/newsletter` and click `Start discussion` on one newsletter entry.
2. Confirm `/forum/new` is prefilled for discussion bootstrap.
3. Publish thread and verify thread is linked back to source newsletter.
4. Use linked-discussion view/filter and verify only related threads show.

### 8) Fixture setup checks (PR21)
1. Create test users in Supabase Auth (admin/mod/user A/user B).
2. Run `web/supabase/testing/assign_test_roles_template.sql` after replacing placeholder emails.
3. Confirm role map:
   - `test-admin@example.com` -> `admin`
   - `test-mod@example.com` -> `mod`
   - `test-user-a@example.com` -> `user`
   - `test-user-b@example.com` -> `user`
4. Run `web/supabase/testing/seed_dummy_newsletters_threads_template.sql`.
5. Verify seeded newsletter rows with `[SEED]` marker exist.
6. Optional e2e check: set `E2E_TEST_*` + `E2E_ALT_*` in `web/.env.local` and run `npm run test:e2e`; dual-user notifications test should run (not skip).
7. Run `web/supabase/testing/reset_dummy_content_template.sql` and verify only `[SEED]` rows are removed.

### 9) Attachments checks (PR22 completed)
1. Upload allowed image type/size during thread or reply creation.
2. Confirm uploaded attachment renders for authorized viewers.
3. Attempt oversize/invalid MIME upload and confirm rejection message.
4. Attempt cross-user unauthorized attachment access and confirm denial.

### 10) Admin dashboard checks (PR23 active)
1. Sign in as mod/admin and open `/admin`; confirm dashboard is visible.
2. Sign in as non-mod user and open `/admin`; confirm access denied.
3. Verify dashboard links route correctly to moderation/newsletter/forum/notifications workflows.

### 11) Production hardening checks (PR24)
1. Verify response security headers in preview deployment.
2. Confirm no sensitive auth/session values appear in server logs.
3. Dry-run backup/restore checklist from `web/docs/operations-runbook.md` and record outcome.
4. Re-run role-gated route checks after hardening changes.

### 12) Create-thread auth redirect checks (PR25)
1. Open `/forum/category/general-paddock` while signed out.
2. Confirm CTA label is `Login to create thread`.
3. Click it and verify `/auth/login?next=...` is used.
4. Sign in and confirm redirect to `/forum/new?category=general-paddock`.
5. Repeat while already signed in and confirm CTA label is `Create thread in this category` with direct navigation to `/forum/new`.

## SQL verification (Supabase Dashboard)
1. Open `SQL Editor`.
2. Run `web/supabase/verification/pr15_rate_limit_checks.sql`.
3. Confirm expected rows are returned for all sections.
4. Run `web/supabase/verification/pr17_notifications_checks.sql`.
5. Confirm notifications functions, triggers, and indexes are present.
6. Run `web/supabase/verification/pr20_newsletter_discussion_link_checks.sql` once PR20 migration is applied.
7. After PR22 migration, run `web/supabase/verification/pr22_attachments_checks.sql`.
