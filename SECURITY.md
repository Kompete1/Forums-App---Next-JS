# Security Notes

## Secret Management
- Never commit real keys, tokens, or service-role credentials.
- Keep local values in `.env.local`.
- Keep deployment values in Vercel environment variable settings.
- Rotate keys if accidental exposure is suspected.

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

## Incident Basics
- If policy bug or secret leak occurs:
  1. Restrict access (disable affected route/policy or rotate keys).
  2. Document timeline and impact.
  3. Patch root cause.
  4. Add regression checks in plans/tests/docs.
