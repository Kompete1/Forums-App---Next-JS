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
- Never reuse production passwords for fixture accounts.
- Rotate fixture account passwords if they are shared across contributors.

## Hardening Baseline (Implemented in PR24)
- Baseline security headers configured in `web/next.config.ts`.
- Server-action error logging standardized with token/message redaction.
- Reproducible release and backup/restore checklists documented in `web/docs/operations-runbook.md`.
- Current retention/privacy baseline documented (with fixture-cleanup workflow).

## Security Header Hardening (PR40)
- `Content-Security-Policy` is enforced for all app routes (including `/health`) via `web/next.config.ts`.
- Embedding strategy is mode-driven:
  - `SECURITY_EMBED_MODE=deny` (default): `frame-ancestors 'none'` + `X-Frame-Options: DENY`
  - `SECURITY_EMBED_MODE=allowlist`: `frame-ancestors 'self' <allowlisted-origins>` and `X-Frame-Options` is omitted to avoid external-embed conflicts
- Allowlisted origins are provided with `SECURITY_EMBED_ORIGINS` (comma-separated HTTPS origins).
- Current showcase parent origin: `https://kompete1.github.io`.
- Primary deployment posture remains non-embedded by default; allowlist mode is an explicit opt-in.

## Attachments Security Notes (PR22)
- Restrict uploads to image MIME types only (JPEG, PNG, WEBP, GIF).
- Enforce per-file size limit (5MB) and per-action count limit.
- Use private storage bucket and policy-gated object access.
- Ensure storage object paths are owner-scoped and not guessable by simple sequential IDs.

## Incident Basics
- If policy bug or secret leak occurs:
  1. Restrict access (disable affected route/policy or rotate keys).
  2. Document timeline and impact.
  3. Patch root cause.
  4. Add regression checks in plans/tests/docs.
