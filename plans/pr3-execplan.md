# PR3 ExecPlan: Supabase Data Layer (Profiles + Posts + RLS)

## Summary
Implement the first database-backed forum slice in `web/` with SQL migrations, strict RLS, and a minimal `/forum` page proving guest read + authenticated owner writes.

## Scope
- Add SQL migration for `profiles` and `posts` tables.
- Auto-create `profiles` row on `auth.users` signup via trigger.
- Enable RLS and owner-scoped write policies.
- Add `src/lib/db/posts.ts` helpers: `listPosts`, `createPost`, `updatePost`, `deletePost`.
- Add `/forum` page for listing and owner-only create/edit/delete UI.
- Update docs with migration apply instructions and quick verification.

## Decisions
- Migrations are committed under `web/supabase/migrations/`.
- Writes are done server-side using existing SSR Supabase client and RLS.
- `/forum` uses server actions for create/update/delete and revalidates the page after each write.

## Acceptance
- `npm run lint` passes in `web/`.
- `npm run build` passes in `web/`.
- Guest can read `/forum` posts.
- Signed-in user can create/update/delete own posts only.
- Profile rows are auto-created on signup.
