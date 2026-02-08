# PR22 ExecPlan: Attachments and Images (Supabase Storage)

## Summary
Implement thread/reply image attachments backed by Supabase Storage with strict validation and access control.

## Goals
- Support image attachments on thread/reply workflows.
- Enforce file limits and safe MIME/size validation.
- Maintain least-privilege access via RLS and storage controls.

## Non-goals
- No rich-text editor.
- No non-image file support in first slice.
- No admin dashboard implementation in this PR.

## Assumptions and open questions
- Assumption: use a dedicated `forum-attachments` bucket.
- Assumption: first slice limits max file size/count conservatively.
- Open question: none blocking.

## User journeys
1. Signed-in user uploads images during thread/reply creation.
2. Readers can view attachments on accessible content.
3. Unauthorized users cannot access private attachments.

## Interfaces and data model
- Planned table: `public.attachments`
  - links each attachment to thread or reply owner context.
- Planned storage bucket + access policies.
- Verification SQL check file to confirm objects/policies/indexes.

## Authorization/RLS policy plan
- Attachment ownership and parent-content visibility enforced in RLS.
- Delete rights for owner and moderator/admin.

## Step-by-step implementation plan
1. Add migration for table/indexes/RLS and storage policies.
2. Add verification SQL check script.
3. Add server-side helpers for upload validation and metadata persistence.
4. Add UI upload controls and attachment rendering.
5. Extend testing docs for upload and access-denied paths.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase:
  - apply migration.
  - verify bucket/policies.
- Vercel:
  - verify upload and rendering in preview.
- Repo A: unchanged.

## Acceptance criteria
1. Signed-in users can upload allowed images.
2. Disallowed MIME/size files are rejected with clear feedback.
3. Authorized readers can view attachments; unauthorized access is denied.
4. Baseline verification commands pass and docs are updated.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - valid upload, invalid upload, and cross-user denial checks.

## Risks and mitigations
- Risk: storage policy misconfiguration.
- Mitigation: explicit SQL verification checks plus cross-user manual tests.

## Rollback/backout approach
- Revert app changes and disable attachment UI paths.
- Keep additive schema as dormant if rollback required quickly.
