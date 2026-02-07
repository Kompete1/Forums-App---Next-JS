# V1 ExecPlan: MVP Forum (Categories, Threads, Replies, Profile, RLS)

## 1. Summary
Start V1 from PR3 baseline (`profiles` + `posts` + `/forum`) with minimal schema change:
- Keep `posts` as thread records.
- Add `categories` and `replies`.
- Keep public read and authenticated writes under strict owner-boundary RLS.
- Add minimal display-name UX and display-name rendering in forum views.

## 2. Goals
- Public read for categories, threads, replies.
- Authenticated create for thread and reply.
- Minimal profile display-name management.
- Owner-only update/delete policies for authored content.
- Keep changes incremental and reviewable through small PRs.

## 3. Non-goals
- Moderation roles and admin workflows.
- Rich-text editor, attachments, realtime, search, pagination.
- Category management UI (create/edit/delete categories).
- Large UI redesign.

## 4. Assumptions and Defaults
- `posts` is retained and treated as threads to avoid major refactors.
- Default seeded category is `general` and legacy posts are backfilled to it.
- RLS remains the authorization source of truth; UI checks are convenience only.
- Supabase Dashboard SQL Editor is primary migration path; CLI is optional.

## 5. Interfaces and Data Model Changes

### New table: `public.categories`
- `id uuid primary key default gen_random_uuid()`
- `slug text unique not null`
- `name text unique not null`
- `description text null`
- `created_at timestamptz not null default now()`

### Existing table evolution: `public.posts`
- Add `category_id uuid` -> FK to `public.categories(id)`.
- Backfill existing rows to seeded `general` category.
- Enforce `category_id` as `not null`.

### New table: `public.replies`
- `id uuid primary key default gen_random_uuid()`
- `thread_id uuid not null references public.posts(id) on delete cascade`
- `author_id uuid not null references public.profiles(id) on delete cascade`
- `body text not null check (char_length(body) between 1 and 5000)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### App helper interface additions
- `web/src/lib/db/categories.ts`
  - `listCategories()`
- `web/src/lib/db/replies.ts`
  - `listRepliesByThreadIds(threadIds)`
  - `createReply(input)`
- `web/src/lib/db/profiles.ts`
  - `getMyProfile()`
  - `updateMyDisplayName(displayName)`
- `web/src/lib/db/posts.ts` evolves from post semantics to thread semantics while retaining compatibility aliases.

## 6. Authorization / RLS Policy Plan
- `categories`: public `select` only (`using (true)`), no write policies.
- `posts`: keep existing public-read + owner insert/update/delete policies.
- `replies`:
  - public `select using (true)`
  - owner `insert with check (auth.uid() = author_id)`
  - owner `update using/check (auth.uid() = author_id)`
  - owner `delete using (auth.uid() = author_id)`

## 7. PR Breakdown

## PR5 (V1-PR1): Schema + RLS Foundation
### Scope
- Add migration for `categories`, `posts.category_id`, `replies`, indexes, triggers, and RLS.
- Seed default `general` category and backfill existing posts.
- Add DB helper modules/types for categories/replies/profiles.
- Update `web/README.md` with SQL apply and policy verification steps.

### Acceptance
1. `npm run lint` passes in `web/`.
2. `npm run build` passes in `web/`.
3. Migration runs in Supabase SQL Editor without errors.
4. `categories`, `posts.category_id`, and `replies` exist with expected constraints/indexes.
5. Guest can `select` categories/threads/replies.
6. Unauthenticated insert to `posts`/`replies` fails.
7. Authenticated user can insert own content and cannot update/delete others.

## PR6 (V1-PR2): Public Read MVP UI
### Scope
- Update `/forum` to render categories, threads, and per-thread replies.
- Add category filter via query param.
- Display author display name when available, with UUID fallback.

### Acceptance
1. Guest can browse categories, threads, replies.
2. Category filter works.
3. Author labels use display-name fallback logic.
4. `npm run lint` and `npm run build` pass.

## PR7 (V1-PR3): Authenticated Create Thread/Reply
### Scope
- Add server actions/forms for creating thread and reply.
- Keep guest read-only and auth-gate writes.

### Acceptance
1. Logged-in user can create thread in selected category.
2. Logged-in user can create reply on a thread.
3. Guest sees no write forms.
4. Non-owner update/delete attempts fail via RLS.
5. `npm run lint` and `npm run build` pass.

## PR8 (V1-PR4): Display Name UX + Docs Finalization
### Scope
- Add minimal display-name form for signed-in user.
- Ensure display names appear on thread/reply rendering.
- Finalize README for full V1 SQL and verification coverage.

### Acceptance
1. Signed-in user can set/update own display name.
2. Cross-user profile update is blocked.
3. Updated display name appears in forum thread/reply labels.
4. README includes exact dashboard SQL and manual auth/RLS checks.
5. `npm run lint` and `npm run build` pass.

## 8. Manual Platform Steps (Supabase/Vercel)
- Apply migration files in Supabase SQL Editor in filename order.
- Confirm auth redirect URLs still include localhost/preview/prod domains.
- Keep only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in app runtime env.

## 9. Verification Matrix
- Commands:
  - `npm run lint`
  - `npm run build`
- Guest: can read categories/threads/replies, cannot create writes.
- Auth user: can create thread/reply and update own display name.
- Non-owner: cannot update/delete another user’s thread/reply/profile.

## 10. Risks and Mitigations
- Risk: migration backfill/constraint order fails on existing posts.
  - Mitigation: seed `general` before backfill; set `not null` after backfill.
- Risk: RLS regressions.
  - Mitigation: explicit owner/non-owner verification SQL and UI checks.
- Risk: UI relies on display name availability.
  - Mitigation: deterministic fallback to `author_id`.

## 11. Rollback / Backout
- If deployment fails due to migration issue, roll back app code and fix forward with a new corrective migration.
- If policy bug appears, temporarily tighten by disabling affected write UI and patch RLS immediately.
