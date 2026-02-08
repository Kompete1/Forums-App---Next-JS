# PR23 ExecPlan: Admin Dashboard

## Summary
Introduce a role-gated admin/mod dashboard to centralize moderation and operational visibility.

## Goals
- Add `/admin` route gated to moderator/admin roles.
- Provide consolidated operational panels (reports/newsletters/role lookup summaries).
- Keep first dashboard slice read-focused and low-risk.

## Non-goals
- No user-ban or destructive moderation in first slice.
- No replacement of existing `/moderation/reports` page in this PR.

## Assumptions and open questions
- Assumption: reuse existing role checks from `user_roles`.
- Assumption: dashboard can aggregate existing data helpers in server components.
- Open question: none blocking.

## User journeys
1. Moderator/admin opens `/admin` and sees actionable summaries.
2. Non-moderator receives access denied.
3. Moderator can navigate quickly to detailed moderation/report/newsletter pages.

## Interfaces and data model
- New route: `web/src/app/admin/page.tsx`.
- Reuse existing report/role/newsletter interfaces first.
- No schema changes expected in initial slice.

## Authorization/RLS policy plan
- Route gating via existing role helper.
- Underlying data access remains RLS-constrained.

## Step-by-step implementation plan
1. Build `/admin` role-gated page shell.
2. Add summary widgets and quick links.
3. Add lightweight stats panels (read-only).
4. Update docs and manual role-gate checks.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: preview check for `/admin`.
- Repo A: unchanged.

## Acceptance criteria
1. `/admin` is visible only to admin/mod users.
2. Dashboard summaries render with accurate data.
3. Existing moderation route behavior remains unchanged.
4. Verification commands pass and docs updated.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - `/admin` access denied for normal user and allowed for mod/admin.

## Risks and mitigations
- Risk: accidental data overexposure in dashboard queries.
- Mitigation: rely on existing RLS-constrained helpers and role gate route.

## Rollback/backout approach
- Revert dashboard route/components.
