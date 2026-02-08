# Security Notes

## Secret Management
- Never commit real keys, tokens, or service-role credentials.
- Keep local values in `.env.local`.
- Keep deployment values in Vercel environment variable settings.
- Rotate keys if accidental exposure is suspected.
- Do not commit automation scripts that require `SUPABASE_SERVICE_ROLE_KEY`.

## Auth Baseline (V0)
- Use Supabase Auth with email/password.
- Configure allowed redirect URLs for localhost, Vercel preview, and production.
- Prefer enabling email confirmation before broad public exposure.

## RLS Baseline (V0)
- Enable RLS on all app-owned tables.
- Grant only minimum required permissions.
- Verify unauthorized writes fail before release.

## Policy Checklist for PRs Touching Data Access
- Table has RLS enabled.
- SELECT/INSERT/UPDATE/DELETE policies explicitly defined.
- Ownership checks use `auth.uid()` where applicable.
- Manual verification steps included in PR notes.

## Logging and Privacy
- Do not log raw credentials or long-lived tokens.
- Keep personal data minimal (display name and auth identity only in V0).

## Test Accounts and Fixtures
- Use real Supabase Auth test users for local/QA role-sensitive checks.
- Assign roles through `public.user_roles` SQL helpers, not hardcoded app mocks.
- Seed dummy content with explicit markers (for example `[SEED]`) so cleanup is scoped and safe.
- Never reuse production identities for test fixtures.

## Upcoming Hardening Checklist (PR24 Scope)
- Add and verify baseline security headers in Next.js config.
- Standardize server-side error logging boundaries to avoid sensitive token/session leakage.
- Document backup/restore habit and incident response steps in reproducible checklists.
- Document table-level data retention and privacy handling notes.

## Incident Basics
- If policy bug or secret leak occurs:
  1. Restrict access (disable affected route/policy or rotate keys).
  2. Document timeline and impact.
  3. Patch root cause.
  4. Add regression checks in plans/tests/docs.
