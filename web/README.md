# Forums App (Next.js)

V1 MVP Forum includes:
- Public read of categories, threads, and replies
- Authenticated create of threads and replies
- Minimal profile display name management
- RLS owner boundaries for write operations

## Prerequisites

- Node.js 20+
- Supabase project with Email auth enabled

## Environment Variables

Set these values in `web/.env.local` (do not commit):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Set the same variables in Vercel Preview and Production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Auth URL Configuration

In Supabase Dashboard -> Authentication -> URL Configuration:
- Site URL:
  - `https://forums-app-next-js.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/*`
  - `https://forums-app-next-js.vercel.app/*`
  - `https://*.vercel.app/*` (or your exact preview pattern)

## Run Locally

From `web/`:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/forum`
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/signup`

## Verification Commands

From `web/`:

```bash
npm run lint
npm run build
```

## Migration Files

Apply these in filename order:
- `web/supabase/migrations/20260207_pr3_profiles_posts_rls.sql`
- `web/supabase/migrations/20260207_pr5_v1_categories_replies.sql`

## Apply SQL (Dashboard-first, exact steps)

1. Open Supabase Dashboard.
2. Select your project.
3. Click `SQL Editor`.
4. Click `New query`.
5. Paste `web/supabase/migrations/20260207_pr3_profiles_posts_rls.sql` and click `Run`.
6. Create another query tab.
7. Paste `web/supabase/migrations/20260207_pr5_v1_categories_replies.sql` and click `Run`.
8. Open `Table Editor` and confirm tables: `profiles`, `posts`, `categories`, `replies`.
9. Open `Database` -> `Triggers` and confirm:
   - `on_auth_user_created`
   - `set_profiles_updated_at`
   - `set_posts_updated_at`
   - `set_replies_updated_at`

## Apply SQL (CLI optional)

If Supabase CLI is installed and linked:

```bash
cd web
supabase db push
```

## V1 Manual Verification (Auth + Forum + RLS)

### A) Public read
1. Open `/forum` while logged out.
2. Confirm category links are visible.
3. Confirm thread list is visible.
4. Open a category filter (for example `/forum?category=general`) and confirm results filter correctly.
5. Confirm replies are visible for each thread.

### B) Authenticated write
1. Sign up or log in.
2. Open `/forum`.
3. In `Profile`, set a display name and save.
4. Create a thread by selecting a category, title, and body.
5. Open the created thread and add a reply.
6. Confirm your display name appears on your thread/reply (fallback is UUID when display name is empty).

### C) Ownership boundaries
1. While signed in as user A, create a thread and reply.
2. Sign in as user B in a separate browser/private window.
3. Confirm user B can read user A content.
4. Confirm user B cannot edit/delete user A thread in UI.
5. Attempt non-owner write in SQL Editor and confirm failure:

```sql
-- As user B session (or via API client with user B JWT), this should fail with RLS:
update public.posts
set title = 'unauthorized'
where id = '<thread-id-created-by-user-a>';

delete from public.replies
where id = '<reply-id-created-by-user-a>';

update public.profiles
set display_name = 'hijack'
where id = '<user-a-id>';
```

## RLS Policy Summary

- `profiles`
  - public read
  - owner insert/update only
- `posts` (threads)
  - public read
  - owner insert/update/delete only
- `categories`
  - public read only
- `replies`
  - public read
  - owner insert/update/delete only

## Schema Summary (V1)

- `public.profiles`
  - `id`, `email`, `display_name`, timestamps
- `public.categories`
  - `id`, `slug`, `name`, `description`, `created_at`
- `public.posts` (thread records)
  - `id`, `author_id`, `category_id`, `title`, `body`, timestamps
- `public.replies`
  - `id`, `thread_id`, `author_id`, `body`, timestamps

## Notes

- Authorization is enforced by Supabase RLS, not only by UI checks.
- Keep secrets out of git; only use `.env.local` and Vercel env settings.
- Dashboard-first SQL steps are the canonical path; CLI remains optional.
