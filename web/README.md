# Forums App (Next.js)

Current scope includes:
- V1 forum MVP: categories, threads, replies, profile display name, RLS ownership boundaries
- V1.5 newsletter: admin-only newsletter creation and public newsletter feed
- V2 PR1 roles foundation: canonical app roles for future moderation
- V2 PR2 thread locking: moderator/admin lock control and locked-reply guard
- V2 PR3 reports pipeline: report thread/reply and moderator report review
- V2 PR4 UI/UX redesign: SA motorsport branding, landing hero, forum discovery + detail IA
- V2 PR5 anti-spam baseline: DB cooldowns/burst limits with inline rate-limit feedback
- V2 PR6 hardening: Playwright e2e baseline + shared flash-message parsing + verification assets
- V3 PR17 notifications (completed): schema + event triggers + inbox + realtime refresh
- V3 PR19 forum UX polish (completed)
- V3 PR20 newsletter discussion bridge (completed)
- V3 PR21 test fixtures and role setup (completed)
- V3 PR22 attachments/images with Supabase Storage (completed)
- V3 PR23 admin dashboard (completed)
- V4 PR24 production hardening pack (completed)
- V4 PR26 auth session consistency hotfix (completed)
- V5 PR27 UX redesign execution wave (completed):
  - auth `returnTo` redirect consistency
  - avatar/user menu signed-in nav
  - thread/category readability refresh
  - thread reporting modal UX
  - last-activity sorting bump on reply
- V5 PR28-PR30 UX modernization wave (completed):
  - dense discovery/thread layout reflow
  - notification bell dropdown preview
  - profile activity tab
  - contribution composer polish (counters, previews, sticky submit)
  - theme toggle and tokenized light/dark support
- V5 PR31 writer experience wave (completed):
  - markdown toolbar authoring controls
  - quote-to-reply shortcuts
  - local draft autosave/recovery and unload protection
- V5 PR32 discovery intelligence wave (completed):
  - computed thread signal chips (`Unanswered`, `Active`, `Popular`) in discovery rows
  - explicit sort/filter context line on `/forum` and `/forum/category/[slug]`
  - no schema/policy/route changes
- V5 PR33 discovery quick filters wave (completed):
  - quick filter chips (`All`, `Unanswered`, `Active`, `Popular`) for discovery lists
  - URL `signal` param support on `/forum` and `/forum/category/[slug]`
  - server-side signal filtering in discovery page loaders
- V5 PR34 engagement reactions wave (active):
  - one-way likes for thread starter posts and replies
  - DB-backed reaction table with RLS and self-like guard
  - discovery rows show thread like counts

## Roadmap Status Note

- Completed through V2 PR6: roles, thread locking, reports, UI/UX redesign + SA category structure, anti-spam/rate-limit baseline, hardening/test automation baseline.
- Completed through V4 PR26: auth session consistency and explicit logout route behavior.
- Hide/remove posts moderation slice is intentionally deferred/skipped for now.
- Active build: V5 PR34 engagement reactions upgrades.

## Documentation Sync Contract

Every feature PR must include:
- one new `plans/<pr>-execplan.md`
- a `SPEC.md` status update
- at least one verification-doc update (`web/README.md` or `web/docs/testing-manual.md`)

A PR is not done until docs clearly capture:
- what changed
- how it was verified
- what remains pending

## Prerequisites

- Node.js 20+
- Supabase project with Email auth enabled

## Environment Variables

Set these values in `web/.env.local` (do not commit):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# optional: enable write/preview tabs in thread/reply composers
NEXT_PUBLIC_ENABLE_MARKDOWN_PREVIEW=0
```

Set the same values in Vercel Preview and Production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Auth URL Configuration

In Supabase Dashboard -> Authentication -> URL Configuration:
- Site URL:
  - `https://forums-app-next-js.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/*`
  - `https://forums-app-next-js.vercel.app/*`
  - `https://*.vercel.app/*` (or exact preview domain pattern)

## Auth Session Consistency (SSR)

- `web/middleware.ts` keeps Supabase auth cookies in sync for server-rendered routes.
- Protected routes such as `/forum/new` redirect to login with `returnTo=<return-path>`.
- After sign-in, login returns users to a safe internal `returnTo` path when present.

## Auth Return-To Contract (V5)

- Login accepts `returnTo` as primary redirect query.
- Legacy `next` remains temporarily supported for backwards compatibility.
- `returnTo` is validated to safe internal paths only (no external redirects).
- Direct login without return destination redirects to `/forum`.

## Run Locally

From `web/`:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/forum`
- `http://localhost:3000/forum/new`
- `http://localhost:3000/forum/category/main-circuit-discussions`
- `http://localhost:3000/categories`
- `http://localhost:3000/profile`
- `http://localhost:3000/newsletter`
- `http://localhost:3000/notifications`
- `http://localhost:3000/admin` (mod/admin only)
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/signup`

## Verification Commands

From `web/`:

```bash
npm run lint
npm run build
npm run test:e2e
npm run test:e2e -- tests/e2e/reactions.spec.ts
npm run test:e2e -- tests/e2e/discovery-quick-filters.spec.ts
npm run test:e2e -- tests/e2e/discovery-signals.spec.ts
```

Security header smoke check is covered in e2e (`tests/e2e/security-headers.spec.ts`).

## Playwright E2E Setup

From `web/`:

```bash
npx playwright install chromium
```

Optional auth test credentials in `web/.env.local`:

```bash
E2E_TEST_EMAIL=your_test_user_email
E2E_TEST_PASSWORD=your_test_user_password
E2E_ALT_EMAIL=secondary_test_user_email
E2E_ALT_PASSWORD=secondary_test_user_password
```

Notes:
- Guest e2e tests run without these credentials.
- Auth e2e tests are skipped automatically if credentials are missing.
- Dual-user notifications e2e tests are skipped if `E2E_ALT_*` credentials are missing.

Fixture setup templates (PR21):
- `web/supabase/testing/assign_test_roles_template.sql`
- `web/supabase/testing/seed_dummy_newsletters_threads_template.sql`
- `web/supabase/testing/reset_dummy_content_template.sql`

## PR21 Test Fixtures Quickstart

Use this order in Supabase SQL Editor after creating test users in Auth:
1. `web/supabase/testing/assign_test_roles_template.sql`
2. `web/supabase/testing/seed_dummy_newsletters_threads_template.sql`
3. Optional cleanup: `web/supabase/testing/reset_dummy_content_template.sql`

Recommended test users and roles:
- `test-admin@example.com` -> `admin`
- `test-mod@example.com` -> `mod`
- `test-user-a@example.com` -> `user`
- `test-user-b@example.com` -> `user`

Verify role assignments:
```sql
select u.email, ur.role, ur.created_at
from public.user_roles ur
join auth.users u on u.id = ur.user_id
where u.email in (
  'test-admin@example.com',
  'test-mod@example.com',
  'test-user-a@example.com',
  'test-user-b@example.com'
)
order by u.email, ur.role;
```

Verify seeded content:
```sql
select id, title, created_at
from public.newsletters
where title like '[SEED]%'
order by created_at desc;
```

## Migration Files

Apply in this exact order:
- `web/supabase/migrations/20260207_pr3_profiles_posts_rls.sql`
- `web/supabase/migrations/20260207_pr5_v1_categories_replies.sql`
- `web/supabase/migrations/20260207_pr9_v1_5_newsletters.sql`
- `web/supabase/migrations/20260207_pr10_v2_roles_foundation.sql`
- `web/supabase/migrations/20260207_pr11_v2_thread_locking.sql`
- `web/supabase/migrations/20260207_pr12_v2_reports_pipeline.sql`
- `web/supabase/migrations/20260207_pr13_v2_sa_forum_categories.sql`
- `web/supabase/migrations/20260208_pr15_v2_anti_spam_rate_limit.sql`
- `web/supabase/migrations/20260208_pr17_v3_notifications.sql`
- `web/supabase/migrations/20260208_pr20_v3_newsletter_discussion_bridge.sql`
- `web/supabase/migrations/20260208_pr22_v3_attachments_storage.sql`
- `web/supabase/migrations/20260209_pr27_v5_thread_last_activity.sql`
- `web/supabase/migrations/20260210_pr34_v5_engagement_reactions.sql`

Planned upcoming migration checkpoints:
- PR24: production hardening config/docs checkpoint.

## Apply SQL (Dashboard-first)

1. Open Supabase Dashboard.
2. Select project.
3. Open `SQL Editor`.
4. Run each migration file above in order (new query tab per file).
5. Verify tables exist in `Table Editor`:
   - `profiles`, `posts`, `categories`, `replies`, `newsletter_admins`, `newsletters`, `user_roles`, `reports`, `reactions`.
6. Verify SA motorsport categories exist in `categories` (including `sim-racing-discussions`).
7. Verify triggers in `Database` -> `Triggers`:
   - `on_auth_user_created`
   - `set_profiles_updated_at`
   - `set_posts_updated_at`
   - `set_replies_updated_at`
   - `set_newsletters_updated_at`
   - `on_profile_created_set_default_role`

Planned verification scripts for upcoming slices:
- `web/supabase/verification/pr20_newsletter_discussion_link_checks.sql`
- `web/supabase/verification/pr22_attachments_checks.sql`
- `web/supabase/verification/pr27_thread_last_activity_checks.sql`
- `web/supabase/verification/pr34_reactions_checks.sql`

## Bootstrap Moderator/Admin Roles

`user_roles` is the source of truth for moderation authorization.

Grant admin role:

```sql
insert into public.user_roles (user_id, role)
values ('<your-profile-id>', 'admin')
on conflict (user_id, role) do nothing;
```

Grant mod role:

```sql
insert into public.user_roles (user_id, role)
values ('<your-profile-id>', 'mod')
on conflict (user_id, role) do nothing;
```

Optional check:

```sql
select user_id, role, created_at
from public.user_roles
order by created_at desc;
```

## Deprecated: newsletter_admins

`newsletter_admins` is kept for compatibility in this PR but is no longer used by newsletter RLS authorization.
Do not rely on it for new admin grants; use `user_roles` instead.

## Apply SQL (CLI optional)

If Supabase CLI is installed and linked:

```bash
cd web
supabase db push
```

## Manual Verification

### A) Forum (V1)
1. Open `/forum` as guest and confirm discovery list is read-only and threads are primary content.
2. Open `/forum/category/<slug>` from category links and confirm feed is scoped to that category.
3. Sign in and open `/forum/new` to create a thread; confirm redirect to `/forum/category/<slug>` and that the new thread appears in that feed.
4. Reply on `/forum/<threadId>`.
5. Apply filters (search/sort/category where available) and confirm results remain scoped correctly.
6. Confirm non-owner cannot edit/delete others' thread content.
7. Open `/profile`, update display name, and confirm it renders on authored content.

### B) Thread locking moderation (V2 PR2)
1. Sign in as a user with `admin` or `mod` role in `user_roles`.
2. Open `/forum`, locate a thread, and click `Lock thread`.
3. Confirm thread shows `Status: Locked`.
4. Confirm reply form is hidden and `Thread is locked.` message is shown.
5. Click `Unlock thread` and confirm status returns to `Open` and reply form returns.
6. Sign in as user without `admin`/`mod`; confirm lock/unlock controls are not shown.

### C) Locked-thread reply RLS guard (V2 PR2)
1. Lock a thread as admin/mod.
2. Attempt reply insert and confirm rejection:

```sql
insert into public.replies (thread_id, author_id, body)
values ('<locked-thread-id>', '<signed-in-user-id>', 'should fail while locked');
```

3. Unlock thread and retry; insert should succeed when thread is open.

### D) Reports flow (V2 PR3)
1. Sign in as regular authenticated user.
2. Open `/forum` and submit `Report thread` for one thread.
3. Submit `Report reply` for one reply.
4. Confirm duplicate report on same target by same user is rejected (unique constraint).
5. Sign in as admin/mod and open `/moderation/reports`; confirm reports are visible.
6. Sign in as non-mod user and open `/moderation/reports`; confirm access denied.
7. Verify non-mod cannot read all reports via SQL/API:

```sql
select id, reporter_id, target_type, reason, created_at
from public.reports
order by created_at desc;
```

Expected for non-mod: only own reports are returned (or none).

### E) Newsletter feed public read (V1.5)
1. Open `/newsletter` as guest.
2. Confirm existing newsletter entries are visible.

### F) Newsletter admin-only create via roles (V2 PR1)
1. Ensure your user has `admin` in `user_roles`.
2. Sign in as that user.
3. Open `/newsletter` and confirm create form is visible.
4. Publish a newsletter entry and confirm it appears in feed.

### G) Newsletter non-admin restrictions
1. Sign in as user without `admin` role in `user_roles`.
2. Open `/newsletter` and confirm create form is hidden.
3. Attempt insert/update/delete directly as non-admin and confirm RLS rejection.

### H) Owner boundary on newsletters
1. Create newsletter as admin user A.
2. Sign in as admin user B.
3. Attempt update/delete of user A's newsletter and confirm rejection (owner boundary remains enforced).

### I) Anti-spam / rate-limit baseline (V2 PR15)
1. Sign in as regular user and create a thread in `/forum/new`.
2. Immediately create a second thread and confirm thread cooldown message appears (about 60s window).
3. Open one thread, post a reply, then immediately post another and confirm reply cooldown message appears (about 20s window).
4. Submit a thread or reply report, then immediately submit another and confirm report cooldown message appears (about 30s window).
5. Submit more than 10 reports within 15 minutes and confirm burst-limit message appears.
6. Confirm duplicate same-target report is still rejected by the existing unique constraint.

### J) Notifications baseline (V3 PR17)
1. Sign in as user A and create a thread.
2. Sign out and sign in as user B.
3. Reply to user A's thread.
4. Sign in again as user A and open `/notifications`.
5. Confirm a new notification appears for the reply.
6. Click `Mark read` and confirm notification changes to read state.
7. Click `Mark all as read` and confirm no unread notifications remain.
8. If user A has `mod`/`admin`, submit a new report as user B and confirm moderation notification appears for user A.

### K) Newsletter discussion bridge (V3 PR20)
1. Open `/newsletter`.
2. Click `Start discussion` on one newsletter entry while signed in.
3. Confirm `/forum/new` is prefilled and shows newsletter linkage context.
4. Publish thread and confirm it is created successfully.
5. Open `/newsletter` again and click `View discussions` for that newsletter.
6. Confirm `/forum?newsletter=<id>` shows linked threads for that newsletter topic.
7. Open linked thread and confirm source newsletter backlink metadata is visible.

### L) Attachments and storage (V3 PR22)
1. Apply `web/supabase/migrations/20260208_pr22_v3_attachments_storage.sql` in Supabase SQL Editor.
2. Open `/forum/new` as signed-in user and attach 1-3 valid images (JPG/PNG/WEBP/GIF, each <=5MB).
3. Publish thread and confirm images render on the thread detail page.
4. Post a reply with image attachment and confirm it renders under that reply.
5. Attempt upload of invalid type or oversize file and confirm inline rejection message appears.
6. Run `web/supabase/verification/pr22_attachments_checks.sql` and confirm table/indexes/policies/bucket are present.

### M) Admin dashboard (V3 PR23)
1. Sign in as mod/admin and open `/admin`; confirm dashboard totals and recent panels render.
2. Confirm quick links route correctly to `/moderation/reports`, `/newsletter`, `/forum`, and `/notifications`.
3. Sign in as non-mod and open `/admin`; confirm access denied.

### N) Production hardening pack (V4 PR24)
1. Open `/health` or any app route and verify headers:
   - `x-content-type-options: nosniff`
   - `referrer-policy: strict-origin-when-cross-origin`
   - `permissions-policy` includes `camera=(), microphone=(), geolocation=()`
   - `x-dns-prefetch-control: off`
   - `cross-origin-opener-policy: same-origin`
2. Trigger a known write failure (for example rate-limit path) and confirm logs include sanitized action context without raw token values.
3. Follow `web/docs/operations-runbook.md` backup/restore dry-run checklist and record results.

### O) Auth redirect-back flow for create thread (PR25)
1. Open `/forum/category/general-paddock` while signed out.
2. Click `Login to create thread` and confirm URL includes `/auth/login?returnTo=...`.
3. Sign in and confirm you land on `/forum/new?category=general-paddock`.
4. While signed in, click `Create thread in this category` and confirm no login bounce occurs.

### P) Auth session consistency and explicit logout (V4 PR26)
1. Open `/auth/login` in a new private/incognito session and sign in with a valid test user.
2. Confirm you land on `/profile`, then wait at least 4 seconds without clicking logout.
3. Click `Back to forum` and confirm `/forum` shows `Signed in as ...` and does not show `Browsing as guest. Sign in to post and reply.`.
4. Return to `/profile`, click `Logout`, and confirm redirect to `/auth/login`.
5. Open `/forum` and confirm guest messaging is shown after explicit logout.
6. Open `/auth/logout` directly and confirm it redirects to `/auth/login` without destructive side effects.

### Q) UX redirect and returnTo flow (V5 PR27)
1. Open `/auth/login` and sign in; confirm landing on `/forum`.
2. While signed out, open `/forum/category/general-paddock` and click `Login to create thread`.
3. Sign in and confirm landing on `/forum/new?category=general-paddock`.
4. While signed out, open any unlocked thread and click `Login to reply`.
5. Sign in and confirm returning to the same `/forum/<threadId>` and seeing `Add reply`.

### R) Activity sort bump-on-reply (V5 PR27)
1. Open `/forum?sort=activity` and note first two thread titles.
2. Open the second thread and post a reply as a signed-in user.
3. Return to `/forum?sort=activity` and confirm that replied thread now appears first.
4. Run `web/supabase/verification/pr27_thread_last_activity_checks.sql` and verify column/index/trigger objects.

### S) UX modernization checks (V5 PR28-PR30)
1. On `/forum`, confirm thread rows are compact and metadata is easy to scan on desktop and mobile.
2. On `/forum/[threadId]`, confirm breadcrumb trail is visible and reply composer is easy to find.
3. While signed out on `/forum/[threadId]`, click `Login to reply`, sign in, and confirm return URL includes `#reply-composer`.
4. In create-thread and reply composers, confirm counters update and image previews can be removed before submit.
5. In header signed-in state, open bell dropdown and confirm recent notification preview + `Mark all read`.
6. Open `/profile?tab=activity` and confirm recent threads/replies/notifications render.
7. Toggle theme button in header and confirm light/dark tokens apply across discovery and thread pages.

### T) Writer experience checks (V5 PR31)
1. Open `/forum/new`, type content, and use `H2`, `H3`, `Bold`, `List`, `Quote`, `Code`, and `Link` toolbar buttons; confirm insertion at cursor.
2. Enable `NEXT_PUBLIC_ENABLE_MARKDOWN_PREVIEW=1` and verify preview shows links and fenced code blocks.
3. Open `/forum/[threadId]` as signed-in user, click `Quote` on a reply, and confirm composer is focused with quoted markdown + `Reply:` suffix.
4. Type draft text in `/forum/new`, refresh, and confirm restore/discard prompt appears.
5. Discard draft and confirm old content does not return on next reload.
6. Post a successful reply and confirm stale draft does not reappear on subsequent visit.
7. Trigger reply error path (cooldown) and confirm draft remains available.

### U) Discovery intelligence checks (V5 PR32)
1. Open `/forum` and confirm context text includes `Sort: Most recent activity`.
2. Open `/forum?sort=newest` and confirm context text changes to `Sort: Newest first`.
3. Confirm thread rows show signal chips using existing data rules:
   - `Unanswered` when `0 replies`
   - `Active` when last activity is within 24 hours
   - `Popular` when replies are `>= 5`
4. Open `/forum/category/<slug>` and confirm the same signal and sort-context behavior.
5. Check mobile width and confirm chips wrap cleanly with no overlap.

### V) Discovery quick filters checks (V5 PR33)
1. Open `/forum` and confirm quick filter chips show `All`, `Unanswered`, `Active`, and `Popular`.
2. Click `Unanswered` and confirm URL contains `signal=unanswered`.
3. Confirm discovery context line includes `Signal: Unanswered`.
4. Validate filtered semantics:
   - each visible row shows `0 replies`, or
   - empty state shows `No threads found for this filter.`.
5. Open `/forum/category/<slug>?signal=active` and confirm `Active` quick filter is marked active.
6. Confirm signal filtering composes with sort/search/category/newsletter params.

### W) Engagement reactions checks (V5 PR34)
1. Open `/forum/[threadId]` while signed in and click `Like` on the thread starter post; confirm count increments and button changes to `Liked`.
2. Click `Like` on at least one reply; confirm reply like count increments and button changes to `Liked`.
3. While signed out, open `/forum/[threadId]` and confirm `Login to like` links are visible for thread/reply reactions.
4. On `/profile?tab=activity`, open one of your own threads and confirm self-like is blocked with `You cannot like your own content.`.
5. Open `/forum` and `/forum/category/<slug>` and confirm thread rows display like count pills.
6. Run `web/supabase/verification/pr34_reactions_checks.sql` and confirm reactions table, indexes, constraints, and policies exist.

## Manual-Only Checks After E2E

Run these manually even when Playwright passes:
- Moderator-only access and lock/unlock flows.
- Report burst window validation (`>10` in 15 minutes).
- Cross-user owner-boundary checks.
- SQL object verification using `web/supabase/verification/pr15_rate_limit_checks.sql`.
- Notifications SQL object verification using `web/supabase/verification/pr17_notifications_checks.sql`.
- Newsletter discussion-link verification using `web/supabase/verification/pr20_newsletter_discussion_link_checks.sql`.
- Attachments verification using `web/supabase/verification/pr22_attachments_checks.sql` (after PR22 migration).
- Admin dashboard role-gate and quick-link checks (`/admin` as mod/admin and non-mod).
- Security headers and sanitized server-action logging checks (PR24).
- Auth session consistency checks (PR26).
- UX returnTo and activity sorting checks (PR27).
- UX modernization checks (PR28-PR30).
- Writer experience checks (PR31).
- Discovery intelligence checks (PR32).
- Discovery quick filters checks (PR33).
- Engagement reactions checks (PR34).
- Backup/restore and release checklists from `web/docs/operations-runbook.md`.

Detailed click-by-click steps are in `web/docs/testing-manual.md`.

## RLS Policy Summary

- `profiles`: public read, owner insert/update
- `posts` (threads): public read, owner insert/update/delete + moderator/admin lock/unlock updates
- `categories`: public read only
- `replies`: public read, owner insert/update/delete, insert blocked when target thread is locked
- `reports`: reporter insert, reporter own read, moderator/admin read all; no update/delete
- `reactions`: public read, owner insert only, self-like blocked by policy, no update/delete
- `user_roles`: user can read own roles; no client write policies
- `newsletter_admins`: own-read only (deprecated for authorization)
- `newsletters`: public read, admin owner insert/update/delete (admin from `user_roles`)

## Notes

- Authorization is enforced in Supabase RLS; UI checks are convenience only.
- Keep secrets out of git.
- Dashboard-first SQL steps are canonical; CLI is optional.
