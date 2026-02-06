# V0 ExecPlan: Setup + Hello Forum (Next.js + Vercel + Supabase)

## 1. Summary
Deliver a minimal end-to-end slice proving platform plumbing works:
- Next.js app deployed on Vercel
- Supabase connected
- Email/password auth works (signup/login/reset)
- Session-aware "Hello Forum" page is visible
- Repo A `forums.html` embeds or links to the deployed app

This plan is intentionally small and learning-oriented. It does not include threads/posts yet.

## 2. Goals
- Establish Repo B app baseline and deployment path.
- Validate Supabase Auth integration and session handling.
- Introduce minimal app data model (`profiles`) with safe RLS.
- Confirm cross-repo integration pattern with Repo A.

## 3. Non-goals
- Categories, threads, replies, or moderation features.
- Rich UI/theme polish.
- Realtime, search, pagination, or storage uploads.
- Admin dashboard and role system.

## 4. Scope Boundaries
- In-scope:
  - Repo B docs and app setup for V0
  - Supabase project configuration and minimal SQL
  - Vercel deployment/env var setup
  - Repo A `forums.html` embed/link adjustment guidance
- Out-of-scope:
  - Repo A broader redesign
  - Production-grade anti-spam pipelines

## 5. Assumptions and Defaults
- Auth method in V0 is email/password only.
- Vercel preview + production deployments are both enabled.
- Supabase and Vercel are created in US regions.
- Email confirmation may be disabled for initial smoke testing, then enabled before public sharing.
- Repo A integration uses iframe plus fallback link for reliability.

## 6. Minimal Open Questions
1. For V0 acceptance, should email confirmation be strictly required or optional?
2. In Repo A, should `forums.html` default to iframe-first or link-first on mobile?

If unanswered, defaults are:
- Email confirmation optional during V0, required before V1 public launch.
- Iframe-first with direct-link fallback.

## 7. User Journeys (V0)

## Journey A: New user signup
1. User opens `/auth/signup`.
2. Enters email + password.
3. Supabase creates account.
4. User sees success state:
   - Redirect to `/hello-forum` when confirmation is not required, or
   - Prompt to verify email when confirmation is required.

## Journey B: Existing user login
1. User opens `/auth/login`.
2. Enters credentials.
3. Successful auth creates/restores session.
4. User reaches `/hello-forum` and sees signed-in UI.

## Journey C: Logged-out visitor
1. Visitor opens `/hello-forum`.
2. App detects no session.
3. Visitor sees guest message and CTA links to login/signup.

## 8. Data Model (V0)

## Supabase built-in
- `auth.users` (managed by Supabase Auth)

## App-owned table
- `public.profiles`
  - `id uuid primary key references auth.users(id) on delete cascade`
  - `display_name text null check (char_length(display_name) between 1 and 40)`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`

## Trigger plan
- Function: create profile row after insert on `auth.users`
- Trigger: `on_auth_user_created` executes function for each new user

## 9. RLS Policy Plan (V0)
- Enable RLS on `public.profiles`.
- Policies:
  - Public read allowed (`SELECT USING (true)`) for MVP simplicity.
  - Authenticated users can `INSERT` only their own row (`WITH CHECK (auth.uid() = id)`).
  - Authenticated users can `UPDATE` only their own row (`USING (auth.uid() = id)` and `WITH CHECK (auth.uid() = id)`).
  - No `DELETE` policy in V0.

Rationale:
- Keeps data model easy to reason about while preventing cross-user writes.
- UI does not need elevated service role logic for basic profile operations.

## 10. Implementation Breakdown (PR-friendly)

## PR0: Docs baseline (this plan and steering docs)
- Add and approve docs:
  - `AGENTS.md`, `SPEC.md`, `PLANS.md`, `README.md`
  - `docs/ARCHITECTURE.md`, `SECURITY.md`, `CONTRIBUTING.md`
  - `plans/v0-execplan.md`, `.env.example`

## PR1: Next.js scaffold + deploy plumbing
- Initialize Next.js app in Repo B.
- Add minimal routes: `/`, `/hello-forum`, `/auth/login`, `/auth/signup`.
- Add Supabase client bootstrap helpers and env validation (lightweight).
- Deploy to Vercel with preview deployments enabled.

## PR2: Auth flow completion
- Implement signup/login/logout/reset behavior.
- Add session-aware rendering on `/hello-forum`.
- Verify redirects and error states.

## PR3: Profiles + RLS
- Add SQL migration script for `profiles` table, trigger, and policies.
- Apply SQL via Supabase dashboard (or CLI alt).
- Verify policy behavior with authenticated/unauthenticated scenarios.

## PR4: Repo A integration (separate repo)
- Update `forums.html` to embed Vercel URL and include fallback link.
- Add minimal responsive styling and accessibility attributes.

## 11. Manual Steps Checklist

## A) Supabase Dashboard (manual)
1. Create Supabase project.
2. In Auth settings:
   - Enable Email provider.
   - Configure site URL (Vercel production URL).
   - Configure redirect URLs:
     - `http://localhost:3000/*`
     - `https://<vercel-preview-domain>/*`
     - `https://<vercel-prod-domain>/*`
3. In SQL editor, run V0 SQL for:
   - `profiles` table
   - `handle_new_user` function + auth trigger
   - RLS enable + policies
4. In Project Settings -> API, copy:
   - Project URL
   - anon public key
5. Put values in local `.env.local` and Vercel environment settings.

## B) Vercel Dashboard (manual)
1. Import Repo B from GitHub.
2. Configure environment variables (all environments):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy and confirm:
   - PRs generate preview URLs.
   - Main branch deploys production URL.
4. Verify auth redirects return correctly from Supabase-hosted flow.

## C) Repo A `forums.html` (manual, separate PR)
1. Add iframe pointing to Repo B production URL.
2. Add direct "Open Forums" link fallback.
3. Apply basic responsive styles:
   - `width: 100%`
   - `min-height: 70vh`
4. Add iframe title attribute for accessibility.

## 12. Suggested SQL (V0 Reference)
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles
  for select
  using (true);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

## 13. Acceptance Criteria (V0 Done = All Pass)
1. Deployed app is reachable at Vercel production URL.
2. User can sign up via `/auth/signup`.
3. User can log in via `/auth/login`.
4. `/hello-forum` clearly shows guest vs authenticated state.
5. New auth user results in `public.profiles` row with matching `id`.
6. Unauthorized update to another user's profile is blocked by RLS.
7. Repo A `forums.html` can open embedded forums experience or fallback link.

## 14. Verification Steps

## Local verification
1. Configure `.env.local` from `.env.example`.
2. Run app locally (after scaffold exists):
   - `npm install`
   - `npm run dev`
3. Test routes:
   - `/`
   - `/auth/signup`
   - `/auth/login`
   - `/hello-forum`

## Remote verification
1. Open Vercel preview URL and repeat auth flow.
2. In Supabase table editor, confirm profile row after signup.
3. Confirm RLS:
   - owner update succeeds
   - non-owner update fails
4. Open Repo A `forums.html`, confirm iframe render and direct-link fallback.

## 15. Risks and Mitigations
- Risk: Redirect URL mismatch breaks login callback.
  - Mitigation: maintain explicit allowlist for localhost/preview/prod.
- Risk: Overly permissive or broken RLS.
  - Mitigation: run explicit owner/non-owner verification before merge.
- Risk: Free-tier pauses or limits.
  - Mitigation: keep V0 load light, document expected behavior on inactivity.
- Risk: Bot/spam signups.
  - Mitigation: enable email confirmation before wider exposure; add rate-limits in V2.

## 16. Exit Criteria and Handoff
- Once all V0 acceptance checks pass, start V1 ExecPlan focused on categories/threads/posts.
- Keep Repo A integration patch as a separate PR to preserve clean boundary.
