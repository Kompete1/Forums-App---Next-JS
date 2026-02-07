# V2 ExecPlan: Roles Foundation (PR10)

## Summary
Introduce a canonical roles foundation for V2 with schema + RLS only, and migrate newsletter authorization to role-based checks.

## Goals
- Add reusable `admin/mod/user` role model.
- Backfill and maintain default `user` role assignment.
- Move newsletter write authorization from `newsletter_admins` to `user_roles`.
- Keep UI behavior stable (no new moderation UI yet).

## Scope
- New migration for enum, `user_roles`, backfill, trigger, and policy updates.
- Add role helpers in app DB layer.
- Keep `newsletter_admins` table for compatibility but mark as deprecated in docs.

## Out of Scope
- Thread locking, reports, moderation UI, admin dashboard.

## Acceptance Criteria
1. `npm run lint` passes in `web/`.
2. `npm run build` passes in `web/`.
3. `user_roles` exists with RLS enabled and own-read policy.
4. Existing profiles have `user` role rows.
5. Newsletter writes require `user_roles.role = 'admin'` and ownership.
6. Public newsletter read remains available.

## Verification
- Apply migrations in order through PR10.
- Insert admin role in `user_roles`, verify admin can publish newsletter.
- Verify non-admin cannot publish newsletter.
- Verify non-owner admin cannot update/delete another author's newsletter.

## Risks / Mitigations
- Risk: role bootstrap missing and no admin can publish.
  - Mitigation: README includes explicit bootstrap SQL.
- Risk: legacy `newsletter_admins` confusion.
  - Mitigation: README marks table as deprecated for authorization.
