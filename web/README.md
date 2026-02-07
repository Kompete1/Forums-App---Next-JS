# Forums App (Next.js)

Current scope includes:
- V1 forum MVP: categories, threads, replies, profile display name, RLS ownership boundaries
- V1.5 newsletter: admin-only newsletter creation and public newsletter feed
- V2 PR1 roles foundation: canonical app roles for future moderation
- V2 PR2 thread locking: moderator/admin lock control and locked-reply guard
- V2 PR3 reports pipeline: report thread/reply and moderator report review
- V2 PR4 UI/UX redesign: SA motorsport branding, landing hero, forum discovery + detail IA

## Roadmap Status Note

- Completed through V2 PR4: roles, thread locking, reports, UI/UX redesign + SA category structure.
- Hide/remove posts moderation slice is intentionally deferred/skipped for now.
- Next V2 focus is anti-spam-rate-limit basics.

## Prerequisites

- Node.js 20+
- Supabase project with Email auth enabled

## Environment Variables

Set these values in `web/.env.local` (do not commit):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/signup`

## Verification Commands

From `web/`:

```bash
npm run lint
npm run build
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

## Apply SQL (Dashboard-first)

1. Open Supabase Dashboard.
2. Select project.
3. Open `SQL Editor`.
4. Run each migration file above in order (new query tab per file).
5. Verify tables exist in `Table Editor`:
   - `profiles`, `posts`, `categories`, `replies`, `newsletter_admins`, `newsletters`, `user_roles`, `reports`.
6. Verify SA motorsport categories exist in `categories` (including `sim-racing-discussions`).
7. Verify triggers in `Database` -> `Triggers`:
   - `on_auth_user_created`
   - `set_profiles_updated_at`
   - `set_posts_updated_at`
   - `set_replies_updated_at`
   - `set_newsletters_updated_at`
   - `on_profile_created_set_default_role`

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

## RLS Policy Summary

- `profiles`: public read, owner insert/update
- `posts` (threads): public read, owner insert/update/delete + moderator/admin lock/unlock updates
- `categories`: public read only
- `replies`: public read, owner insert/update/delete, insert blocked when target thread is locked
- `reports`: reporter insert, reporter own read, moderator/admin read all; no update/delete
- `user_roles`: user can read own roles; no client write policies
- `newsletter_admins`: own-read only (deprecated for authorization)
- `newsletters`: public read, admin owner insert/update/delete (admin from `user_roles`)

## Notes

- Authorization is enforced in Supabase RLS; UI checks are convenience only.
- Keep secrets out of git.
- Dashboard-first SQL steps are canonical; CLI is optional.
