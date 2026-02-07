# Forums App (Next.js)

PR3 adds the first Supabase data layer for forums (profiles + posts with RLS).

## Prerequisites

- Node.js 20+
- A Supabase project with Email auth enabled

## Environment Variables

Set these values locally in `web/.env.local` (do not commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Set the same two variables in Vercel for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Auth Redirect URLs

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL:
  - `https://forums-app-next-js.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/*`
  - `https://forums-app-next-js.vercel.app/*`
  - `https://*.vercel.app/*` (or your exact preview domain pattern)

## Run Locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/hello-forum`
- `http://localhost:3000/forum`
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/signup`
- `http://localhost:3000/auth/reset`
- `http://localhost:3000/protected`

## Verification Commands

```bash
npm run lint
npm run build
```

## Manual Auth Verification

1. Open `/auth/signup` and create an account.
2. Open `/auth/login` and sign in.
3. Open `/hello-forum`:
   - Logged in: page shows signed-in email.
   - Logged out: page shows guest message.
4. Open `/protected` while logged out and confirm redirect to `/auth/login`.
5. Open `/auth/reset`, request a password reset, use the email link, and set a new password.

## Database Schema (PR3)

- `public.profiles`
  - `id uuid` (same value as `auth.users.id`)
  - `email text`
  - `display_name text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- `public.posts`
  - `id uuid`
  - `author_id uuid` (references `public.profiles.id`)
  - `title text`
  - `body text`
  - `created_at timestamptz`
  - `updated_at timestamptz`

## RLS Policies (PR3)

- `profiles`
  - public read
  - owner insert/update only
- `posts`
  - public read
  - authenticated insert only when `auth.uid() = author_id`
  - owner update/delete only

## Migration File

- `web/supabase/migrations/20260207_pr3_profiles_posts_rls.sql`

## Apply Migration (Dashboard SQL Editor)

1. Open Supabase Dashboard.
2. Select your project.
3. Click `SQL Editor`.
4. Click `New query`.
5. Open `web/supabase/migrations/20260207_pr3_profiles_posts_rls.sql` and paste the full SQL.
6. Click `Run`.
7. Confirm tables exist in `Table Editor`: `profiles`, `posts`.
8. Confirm trigger exists in `Database` -> `Triggers`: `on_auth_user_created`.

## Apply Migration (CLI optional)

If Supabase CLI is installed and linked to your project:

```bash
cd web
supabase db push
```

If CLI is not installed, use the Dashboard SQL Editor steps above.

## Manual Forum Verification (PR3)

1. As guest, open `/forum` and confirm posts list is visible.
2. Sign in, open `/forum`, create a post, and confirm it appears.
3. Confirm your own post shows `Update` and `Delete` controls.
4. Sign in with a different account (or private window) and confirm:
   - You can read all posts.
   - You do not see `Update` or `Delete` controls on another user's post.
5. Attempt to update/delete another user's post directly (manual request/tooling) and confirm the write is rejected by policy/app logic.

## Production Notes

- Required runtime env vars remain:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Keep Supabase Auth URL config including:
  - `http://localhost:3000/*`
  - `https://forums-app-next-js.vercel.app/*`
  - preview domain pattern (for example `https://*.vercel.app/*`)
