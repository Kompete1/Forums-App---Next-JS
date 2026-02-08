# PR21 ExecPlan: Supabase Test Fixtures and Role Setup

## Summary
Standardize reproducible local/QA testing with documented Supabase test users, role assignment templates, and dummy content SQL helpers.

## Goals
- Provide repeatable setup for test users (admin/mod/user).
- Provide SQL helpers for role assignment and sample content seeding/reset.
- Improve e2e readiness for dual-user flows.

## Non-goals
- No mock-auth mode in local app code.
- No service-role automation scripts committed to repo.
- No production data migration changes.

## Assumptions and open questions
- Assumption: test users are created in Supabase Dashboard Auth UI.
- Assumption: SQL templates are run manually in SQL Editor.
- Open question: none blocking.

## User journeys
1. Maintainer creates test users in Supabase.
2. Maintainer runs role-assignment template SQL.
3. Maintainer seeds dummy newsletters/threads and runs manual/e2e checks.
4. Maintainer resets seeded content safely.

## Interfaces and data model
- No schema changes.
- New SQL helper templates in `web/supabase/testing/`:
  - `assign_test_roles_template.sql`
  - `seed_dummy_newsletters_threads_template.sql`
  - `reset_dummy_content_template.sql`

## Authorization/RLS policy plan
- Reuse existing RLS and role model (`user_roles`).
- No new RLS policies introduced.

## Step-by-step implementation plan
1. Add testing SQL template files with placeholders and safety notes.
2. Document expected test users and roles in `web/README.md`.
3. Document setup/reset workflow in `web/docs/testing-manual.md`.
4. Update `SECURITY.md` for test-account handling and service-role restrictions.
5. Ensure e2e docs clearly call out `E2E_ALT_*` dual-user dependency.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase:
  - Create test users in Auth users.
  - Run testing SQL templates in SQL Editor.
- Vercel/Repo A: none.

## Acceptance criteria
1. Documented test-user setup is reproducible end-to-end.
2. Role assignment and seeded dummy content templates are available.
3. Reset template safely removes seeded content only.
4. Security docs explicitly forbid committing service-role credentials/scripts.

## Verification steps
- Manual:
  - create users, apply roles, seed content, run role-sensitive checks.
- Optional:
  - run `npm run test:e2e` with `E2E_ALT_*` set to confirm dual-user path.

## Risks and mitigations
- Risk: accidental cleanup of non-seeded content.
- Mitigation: seed marker convention and reset filters limited to seeded markers.

## Rollback/backout approach
- Remove template files and docs updates if approach needs revision.
