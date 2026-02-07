# Forums App (Next.js)

Current scope includes:
- V1 forum MVP: categories, threads, replies, profile display name, RLS ownership boundaries
- V1.5 newsletter: admin-only newsletter creation and public newsletter feed
- V2 PR1 roles foundation: canonical app roles for future moderation
- V2 PR2 thread locking: moderator/admin lock control and locked-reply guard

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
- `http://localhost:3000/forum`
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

## Apply SQL (Dashboard-first)

1. Open Supabase Dashboard.
2. Select project.
3. Open `SQL Editor`.
4. Run each migration file above in order (new query tab per file).
5. Verify tables exist in `Table Editor`:
   - `profiles`, `posts`, `categories`, `replies`, `newsletter_admins`, `newsletters`, `user_roles`.
6. Verify triggers in `Database` -> `Triggers`:
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
1. Open `/forum` as guest and confirm read-only categories/threads/replies.
2. Sign in and create a thread + reply.
3. Update display name and confirm it renders on authored content.
4. Confirm non-owner cannot edit/delete others' thread content.

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

### D) Newsletter feed public read (V1.5)
1. Open `/newsletter` as guest.
2. Confirm existing newsletter entries are visible.

### E) Newsletter admin-only create via roles (V2 PR1)
1. Ensure your user has `admin` in `user_roles`.
2. Sign in as that user.
3. Open `/newsletter` and confirm create form is visible.
4. Publish a newsletter entry and confirm it appears in feed.

### F) Newsletter non-admin restrictions
1. Sign in as user without `admin` role in `user_roles`.
2. Open `/newsletter` and confirm create form is hidden.
3. Attempt insert/update/delete directly as non-admin and confirm RLS rejection.

### G) Owner boundary on newsletters
1. Create newsletter as admin user A.
2. Sign in as admin user B.
3. Attempt update/delete of user A's newsletter and confirm rejection (owner boundary remains enforced).

## RLS Policy Summary

- `profiles`: public read, owner insert/update
- `posts` (threads): public read, owner insert/update/delete + moderator/admin lock/unlock updates
- `categories`: public read only
- `replies`: public read, owner insert/update/delete, insert blocked when target thread is locked
- `user_roles`: user can read own roles; no client write policies
- `newsletter_admins`: own-read only (deprecated for authorization)
- `newsletters`: public read, admin owner insert/update/delete (admin from `user_roles`)

## Notes

- Authorization is enforced in Supabase RLS; UI checks are convenience only.
- Keep secrets out of git.
- Dashboard-first SQL steps are canonical; CLI is optional.
