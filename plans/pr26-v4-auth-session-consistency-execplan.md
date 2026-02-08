# PR26 ExecPlan: Auth Session Consistency Hotfix (Logout Prefetch)

## Summary
Fix production auth inconsistency where users can appear signed in on `/profile` and then appear as guest on `/forum`. The root cause is a side-effectful `GET /auth/logout` route being prefetched from a `next/link` on the profile page, which signs users out without explicit intent.

## Goals
- Ensure sign-out only happens on explicit user action.
- Remove side effects from `GET /auth/logout`.
- Add regression coverage for delayed auto-logout behavior seen in production.
- Keep scope narrow: hotfix + tests + docs sync only.

## Non-goals
- No Supabase schema/RLS migration changes.
- No environment variable or deployment platform configuration changes.
- No broader auth architecture rewrite.

## Assumptions and open questions
- Assumption: Next.js prefetch of `/auth/logout` from profile navigation is the trigger for silent sign-out.
- Assumption: Converting logout to `POST` and making `GET` non-destructive resolves the production inconsistency.
- Assumption: Existing `/forum/new` redirect-back behavior must remain unchanged.
- Open questions: none blocking.

## User journeys
1. Signed-in user visits `/profile`, waits on page, clicks `Back to forum`, and remains signed in.
2. Signed-in user clicks `Logout` on `/profile` and is redirected to `/auth/login` with signed-out state.
3. User directly visits `GET /auth/logout` (bookmark/manual URL) and is safely redirected to `/auth/login` without destructive session mutation.

## Interfaces and data model
- Route behavior change:
  - `POST /auth/logout`: performs `supabase.auth.signOut()` and redirects to `/auth/login` (303).
  - `GET /auth/logout`: redirect-only fallback with no sign-out side effect.
- Profile page session control UI:
  - Replace logout `Link` with `form method="post" action="/auth/logout"`.
- No DB schema/data model changes.

## Authorization/RLS policy plan
- No RLS policy changes.
- No role model changes.
- Supabase auth session handling remains via existing middleware + SSR client patterns.

## Step-by-step implementation plan
1. Create this PR26 execplan in `plans/`.
2. Update `web/src/app/auth/logout/route.ts`:
   - Add `POST` handler for sign-out + redirect.
   - Make `GET` handler redirect-only (safe fallback).
3. Update `web/src/app/profile/page.tsx`:
   - Replace `<Link href="/auth/logout">` with POST form submit button.
   - Keep `Back to forum` as full document navigation (`<a href="/forum">`).
4. Update `web/tests/e2e/forum-create-thread-auth-flow.spec.ts`:
   - Strengthen `direct login then profile back-to-forum stays signed in` by adding a profile idle wait (~4s) before navigating to `/forum`.
   - Add explicit logout behavior test (login -> logout -> `/auth/login` -> `/forum` guest state).
5. Update `web/tests/e2e/notifications.spec.ts`:
   - Replace `page.goto("/auth/logout")` helper with UI-driven POST logout flow via `/profile` + `Logout` button click.
6. Update documentation:
   - `SPEC.md`: add PR26 under V4 active execution slice.
   - `README.md` (root): update milestone and latest execplan pointer to PR26.
   - `web/README.md`: add PR26 status and manual verification section.
   - `web/docs/testing-manual.md`: add manual auth consistency checks for profile idle and explicit logout behavior.
7. Validate locally from `web/`:
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e -- --grep "direct login then profile back-to-forum stays signed in|logout"`
   - `npm run test:e2e -- --grep "notifications"`
8. Validate against production deployment URL:
   - `PLAYWRIGHT_BASE_URL=https://forums-app-next-js.vercel.app npm run test:e2e -- --grep "direct login then profile back-to-forum stays signed in|logout"`

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: no dashboard changes required.
- Vercel:
  - Deploy PR preview first and run targeted auth e2e checks.
  - Promote to production after preview pass.
  - Confirm production deployment SHA serves the fix.
- Repo A: unchanged.

## Acceptance criteria
1. User is not silently signed out while idling on `/profile`.
2. `/profile -> Back to forum` keeps signed-in forum state.
3. Logout happens only via explicit user action.
4. `GET /auth/logout` is non-destructive and safe.
5. Existing PR25 create-thread redirect-back flow remains passing.
6. Docs are updated per planning/doc sync rules.

## Verification steps
- Local (`web/`):
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e -- --grep "direct login then profile back-to-forum stays signed in|logout"`
  - `npm run test:e2e -- --grep "notifications"`
- Production-targeted:
  - `PLAYWRIGHT_BASE_URL=https://forums-app-next-js.vercel.app npm run test:e2e -- --grep "direct login then profile back-to-forum stays signed in|logout"`
- Manual:
  - Login -> `/profile` -> wait ~4s -> `Back to forum` stays signed in.
  - `Logout` button signs out and redirects to `/auth/login`.
  - Direct `GET /auth/logout` does not sign out and redirects safely.

## Risks and mitigations
- Risk: users with existing `GET /auth/logout` bookmarks may expect immediate sign-out.
  - Mitigation: keep route alive with safe redirect and document behavior; explicit UI logout is preserved.
- Risk: added idle guard makes auth tests slower.
  - Mitigation: confine delay to one targeted regression test only.

## Rollback/backout approach
- Revert PR26 commits and redeploy prior SHA.
- Emergency partial fallback: keep POST logout and temporarily disable prefetch if any logout navigation link is reintroduced.
