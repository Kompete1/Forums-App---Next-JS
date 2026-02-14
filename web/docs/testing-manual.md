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
1. User A creates thread/reply.
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

### 7) Resources hub checks (PR38 active)
1. Open `/resources` as guest.
2. Confirm section headings are visible:
   - `Official notices & schedules`
   - `Calendars`
   - `Karting essentials`
   - `Track guides`
   - `Templates`
3. Open `/newsletter` and confirm it redirects to `/resources`.

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
3. Verify dashboard links route correctly to moderation/resources/forum/notifications workflows.

### 11) Production hardening checks (PR24)
1. Verify response security headers in preview deployment.
2. Confirm `/health` includes `content-security-policy` with:
   - `default-src 'self'`
   - `base-uri 'self'`
   - `object-src 'none'`
   - `form-action 'self'`
3. Confirm frame strategy based on mode:
   - default `SECURITY_EMBED_MODE=deny`: CSP has `frame-ancestors 'none'` and `x-frame-options: DENY`
   - `SECURITY_EMBED_MODE=allowlist`: CSP has `frame-ancestors 'self'` + allowlisted origin(s) and no `x-frame-options`
4. In allowlist mode, confirm showcase iframe parent (`https://kompete1.github.io`) can still embed the app.
5. Confirm no sensitive auth/session values appear in server logs.
6. Dry-run backup/restore checklist from `web/docs/operations-runbook.md` and record outcome.
7. Re-run role-gated route checks after hardening changes.

### 12) Create-thread auth redirect checks (PR25)
1. Open `/forum/category/general-paddock` while signed out.
2. Confirm CTA label is `Login to create thread`.
3. Click it and verify `/auth/login?returnTo=...` is used.
4. Sign in and confirm redirect to `/forum/new?category=general-paddock`.
5. Repeat while already signed in and confirm CTA label is `Create thread in this category` with direct navigation to `/forum/new`.

### 13) Auth session consistency + explicit logout checks (PR26)
1. Open `/auth/login` and sign in with a valid user.
2. Confirm landing on `/profile`, then wait at least 4 seconds.
3. Click `Back to forum` and confirm forum still shows signed-in state (`Signed in as ...`) with no guest banner.
4. Navigate back to `/profile`, click `Logout`, and confirm redirect to `/auth/login`.
5. Open `/forum` and confirm guest state is shown after logout.
6. Open `GET /auth/logout` directly and confirm it redirects to `/auth/login` without changing session unless logout is explicitly clicked.

### 14) UX returnTo checks (PR27)
1. Open `/auth/login` and sign in; confirm redirect to `/forum`.
2. While signed out, open `/forum/category/general-paddock` and click `Login to create thread`.
3. Sign in and confirm redirect to `/forum/new?category=general-paddock`.
4. While signed out, open an unlocked thread and click `Login to reply`.
5. Sign in and confirm redirect back to the same thread with visible `Add reply` composer.

### 15) Thread activity sorting checks (PR27)
1. Open `/forum?sort=activity` and note top two thread titles.
2. Open second thread and post a reply.
3. Return to `/forum?sort=activity` and confirm replied thread moved to top.
4. In Supabase SQL Editor, run `web/supabase/verification/pr27_thread_last_activity_checks.sql`.
5. Confirm `last_activity_at` column, indexes, and trigger are present.

### 16) UX modernization checks (PR28-PR30)
1. Open `/forum` on desktop and mobile widths and confirm dense rows remain readable.
2. Open `/forum/[threadId]` and confirm breadcrumb trail and readable reply stream hierarchy.
3. While signed out on an unlocked thread, click `Login to reply`, sign in, and verify return URL ends with `#reply-composer`.
4. In `/forum/new` and reply composer, confirm counters update while typing.
5. Upload 1-3 images and confirm preview thumbnails render and individual removal works before submit.
6. While signed in, open header bell dropdown and confirm recent notifications preview plus `Mark all read`.
7. Open `/profile?tab=activity` and confirm recent threads/replies/notifications are visible.
8. Toggle theme control in header and confirm light/dark token changes apply consistently.

### 17) Writer experience checks (PR31)
1. Open `/forum/new` while signed in and verify markdown toolbar buttons (`H2`, `H3`, `Bold`, `List`, `Quote`, `Code`, `Link`) insert syntax at cursor.
2. Set `NEXT_PUBLIC_ENABLE_MARKDOWN_PREVIEW=1`, switch to preview tab, and confirm links and fenced code blocks render.
3. Open `/forum/[threadId]`, click `Quote` on an existing reply, and confirm composer receives quoted markdown and focus.
4. Type draft text in thread composer, refresh, and confirm restore/discard prompt appears.
5. Discard draft, refresh, and confirm discarded content stays cleared.
6. Type draft text in reply composer, refresh, and confirm restore/discard prompt appears.
7. Submit successful reply/thread and confirm stale draft is cleared on follow-up visit.
8. Trigger rate-limit error path and confirm draft remains available.

### 18) Discovery intelligence checks (PR32)
1. Open `/forum` and confirm a visible discovery context line includes `Sort: Most recent activity`.
2. Open `/forum?sort=newest` and confirm the context line updates to `Sort: Newest first`.
3. Confirm `Unanswered` appears on rows with `0 replies`.
4. Confirm `Active` appears on rows where last activity is within 24 hours.
5. Confirm `Popular` appears on rows with at least 5 replies.
6. Open `/forum/category/<slug>` and confirm sort context plus signal-chip behavior matches `/forum`.
7. Confirm signal chips render cleanly at mobile width without overlapping row controls.

### 19) Discovery quick filters checks (PR33)
1. Open `/forum` and confirm quick filter controls are visible: `All`, `Unanswered`, `Active`, `Popular`.
2. Click `Unanswered` and confirm URL includes `signal=unanswered`.
3. Confirm context line includes `Signal: Unanswered`.
4. Verify filtered semantics:
   - each visible row has `0 replies`, or
   - empty state shows `No threads found for this filter.`.
5. Open `/forum/category/<slug>?signal=active` and confirm `Active` quick filter is active.
6. Apply search/sort while a signal is selected and confirm signal state remains preserved.
7. Click `Clear` and confirm signal filter resets to `All`.

### 20) Engagement reactions checks (PR34)
1. Open `/forum/[threadId]` while signed in and click `Like` on the thread starter post.
2. Confirm thread like count increments and button changes to `Liked`.
3. In the same thread, click `Like` on one reply and confirm reply count increments with `Liked` state.
4. Open `/profile?tab=activity`, navigate to one of your own threads, and confirm self-like is blocked with `You cannot like your own content.`.
5. Sign out, open `/forum/[threadId]`, and confirm `Login to like` links are visible.
6. Open `/forum` and `/forum/category/<slug>` and confirm thread rows show like count pills.
7. Run `web/supabase/verification/pr34_reactions_checks.sql` and confirm table/index/policy objects exist.

### 21) Thread starter emphasis + advanced pagination checks (PR35)
1. Open `/forum/<threadId>` and confirm the thread starter section is visually prominent (`Thread starter` kicker + `Starter post` heading).
2. Confirm thread starter reaction controls (`X likes` + `Like/Liked`) are right-aligned on desktop and wrap cleanly on mobile.
3. Open `/forum` where multiple pages exist and confirm advanced pagination controls render:
   - numbered page links
   - `Next` with tooltip/title `Next page`
   - `»` with tooltip/title `Last page`
   - `Jump to page` select showing `Page X`
4. Use `Next`, `»`, and select jump; confirm URL page query and visible page summary update.
5. Open `/forum/category/<slug>` and confirm same controls work while preserving active query params (for example `sort` and `signal`).

## SQL verification (Supabase Dashboard)
1. Open `SQL Editor`.
2. Run `web/supabase/verification/pr15_rate_limit_checks.sql`.
3. Confirm expected rows are returned for all sections.
4. Run `web/supabase/verification/pr17_notifications_checks.sql`.
5. Confirm notifications functions, triggers, and indexes are present.
6. Run `web/supabase/verification/pr20_newsletter_discussion_link_checks.sql` once PR20 migration is applied.
7. After PR22 migration, run `web/supabase/verification/pr22_attachments_checks.sql`.
8. After PR27 migration, run `web/supabase/verification/pr27_thread_last_activity_checks.sql`.
9. After PR34 migration, run `web/supabase/verification/pr34_reactions_checks.sql`.

### 22) Attachment rendering, draft reliability, and timestamp checks (PR37)
1. Open `/forum/<threadId>` and post replies with a wide image and a tall image.
2. Confirm each rendered reply attachment shows the full image (no crop) within the card.
3. Click attachments and confirm full-size image still opens in a new tab.
4. In an unlocked thread, type a reply and submit successfully.
5. Confirm `Draft found` / `Restore draft` is not shown for that just-posted reply content.
6. Trigger a reply error path (for example cooldown by posting twice quickly) and confirm draft restore remains available.
7. Confirm thread/reply/notification/profile timestamps use `YYYY/MM/DD, HH:mm:ss` and do not show `AM/PM`.
8. Validate displayed values align with SAST (`Africa/Johannesburg`) for known UTC source timestamps.
