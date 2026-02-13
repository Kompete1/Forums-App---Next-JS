# Operations Runbook (PR24)

This runbook is the reproducible baseline for production hardening checks.

## 1) Release Safety Checklist

1. Ensure latest `main` passes CI and local checks:
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e`
2. Confirm Vercel preview is healthy:
   - `/health` returns `OK`
   - `/forum`, `/resources`, `/notifications`, `/admin` load
3. Verify role-gated routes:
   - `/admin` and `/moderation/reports` allowed for mod/admin
   - denied for non-mod users
4. Confirm no secrets are introduced in diff:
   - no `.env.local` commit
   - no service-role keys in code/docs

## 2) Security Header Check

Validate at least once per release window:

1. Open DevTools network tab and request `/health`.
2. Confirm response includes:
   - `x-content-type-options: nosniff`
   - `referrer-policy: strict-origin-when-cross-origin`
   - `permissions-policy: camera=(), microphone=(), geolocation=()`
   - `x-dns-prefetch-control: off`
   - `cross-origin-opener-policy: same-origin`
3. In production only, also confirm:
   - `strict-transport-security` present

## 3) Backup/Restore Dry Run (Supabase Dashboard-first)

Frequency: at least monthly, and before major schema changes.

1. In Supabase Dashboard, open project settings/backups and verify latest automated backup timestamp.
2. Record backup timestamp in release notes or team log.
3. Create a short restore drill plan:
   - target project/environment
   - expected restore point timestamp
   - validation query list
4. If running a full dry run in non-production:
   - restore to a safe environment
   - run sanity checks:
     - `select count(*) from public.posts;`
     - `select count(*) from public.replies;`
     - `select count(*) from public.newsletters;`
     - `select count(*) from public.reports;`
   - verify key routes render with restored data.

## 4) Logging Hygiene Check

1. Trigger one controlled server-action failure (for example, rate-limit path).
2. Inspect server logs and confirm entries use action-scoped log format.
3. Confirm logs do not include raw:
   - `access_token`
   - `refresh_token`
   - `authorization bearer ...`
   - `apikey`
   - `token_hash`

## 5) Data Retention Notes (Current Baseline)

- `posts`, `replies`, `newsletters`, `reports`, `notifications`, `attachments`: retained until explicit cleanup policy is introduced.
- Test fixture rows should use `[SEED]` marker and be cleaned using `web/supabase/testing/reset_dummy_content_template.sql`.
- Do not store additional personally identifiable data beyond current profile/display-name model without spec update.

## 6) Incident Basics

1. Restrict access quickly (route off / policy lock / key rotation).
2. Capture timeline and scope.
3. Patch root cause.
4. Add regression check in tests/docs/plans before closeout.
