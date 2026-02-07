# PR12 ExecPlan: V2 Reports Pipeline (Schema + RLS + Minimal UI)

## Summary
Add moderation reports with strict RLS boundaries and a minimal moderation review page.

## Scope
- Add `reports` table and integrity constraints.
- Enable RLS for reporter insert/own read and moderator read.
- Add report submission actions on forum threads/replies.
- Add `/moderation/reports` for admin/mod review.

## Acceptance Criteria
1. `npm run lint` and `npm run build` pass.
2. Signed-in user can report thread/reply.
3. Guest cannot report.
4. Admin/mod can view moderation reports.
5. Non-mod cannot access full report list.
6. Duplicate report by same reporter+target is rejected.
