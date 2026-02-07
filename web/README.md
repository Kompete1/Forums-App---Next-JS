# Forums App (Next.js)

Current scope includes:
- V1 forum MVP: categories, threads, replies, profile display name, RLS ownership boundaries
- V1.5 newsletter: admin-only newsletter creation and public newsletter feed

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

## Apply SQL (Dashboard-first)

1. Open Supabase Dashboard.
2. Select project.
3. Open `SQL Editor`.
4. Run each migration file above in order (new query tab per file).
5. Verify tables exist in `Table Editor`:
   - `profiles`, `posts`, `categories`, `replies`, `newsletter_admins`, `newsletters`.
6. Verify triggers in `Database` -> `Triggers`:
   - `on_auth_user_created`
   - `set_profiles_updated_at`
   - `set_posts_updated_at`
   - `set_replies_updated_at`
   - `set_newsletters_updated_at`

## Bootstrap Newsletter Admin (required for create)

In SQL Editor, insert at least one admin row (replace with your profile/user UUID):

```sql
insert into public.newsletter_admins (user_id)
values ('<your-profile-id>')
on conflict (user_id) do nothing;
```

You can find your id in `public.profiles` or `auth.users`.

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

### B) Newsletter feed public read (V1.5)
1. Open `/newsletter` as guest.
2. Confirm existing newsletter entries are visible.

### C) Newsletter admin-only create (V1.5)
1. Sign in as a user with a row in `newsletter_admins`.
2. Open `/newsletter` and confirm create form is visible.
3. Publish a newsletter entry and confirm it appears in feed.

### D) Newsletter non-admin restrictions (V1.5)
1. Sign in as user without `newsletter_admins` row.
2. Open `/newsletter` and confirm create form is hidden.
3. Attempt insert/update/delete directly as non-admin and confirm RLS rejection:

```sql
insert into public.newsletters (author_id, title, body)
values ('<non-admin-user-id>', 'Nope', 'Should fail');

update public.newsletters
set title = 'Nope'
where id = '<admin-newsletter-id>';

delete from public.newsletters
where id = '<admin-newsletter-id>';
```

## RLS Policy Summary

- `profiles`: public read, owner insert/update
- `posts` (threads): public read, owner insert/update/delete
- `categories`: public read only
- `replies`: public read, owner insert/update/delete
- `newsletter_admins`: user can read own admin mapping row only
- `newsletters`: public read, admin owner insert/update/delete only

## Notes

- Authorization is enforced in Supabase RLS; UI checks are not the security boundary.
- Keep secrets out of git.
- Dashboard-first SQL steps are canonical; CLI is optional.
