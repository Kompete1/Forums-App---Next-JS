# PR20 ExecPlan: Newsletter Discussion Bridge

## Summary
Introduce a newsletter-to-forum discussion bridge so users can start and discover discussions tied to newsletter topics.

## Goals
- Add `Start discussion` flow from newsletter entries.
- Persist linkage from thread to source newsletter.
- Add filter/view path for linked discussions.
- Keep existing newsletter auth boundaries unchanged.

## Non-goals
- No separate comments system on newsletter page.
- No attachment uploads in this PR.
- No admin dashboard features in this PR.

## Assumptions and open questions
- Assumption: thread-based discussion is the canonical discussion model.
- Assumption: prefill flow uses existing `/forum/new` route.
- Open question: none blocking.

## User journeys
1. User opens `/newsletter` and clicks `Start discussion` on a newsletter entry.
2. User lands on `/forum/new` with prefilled content and publishes thread.
3. User can view discussions linked to that newsletter from newsletter page and forum filter.

## Interfaces and data model
- New posts column:
  - `source_newsletter_id uuid null references public.newsletters(id) on delete set null`
- New posts index:
  - `posts_source_newsletter_id_created_at_desc_idx`
- Planned API/data updates:
  - `createThread(..., sourceNewsletterId?)`
  - forum query filter: `/forum?newsletter=<id>`

## Authorization/RLS policy plan
- Existing `posts` ownership policies remain valid.
- No new client write grants needed.

## Step-by-step implementation plan
1. Add migration for `posts.source_newsletter_id` and index.
2. Add verification SQL checks for new column/index.
3. Extend posts data helpers and forum query parser for newsletter filter.
4. Update newsletter page with:
   - `Start discussion` CTA
   - `View discussions` CTA
5. Update `/forum/new` prefill behavior for `fromNewsletter` param.
6. Add thread detail backlink to source newsletter.
7. Update docs and manual test paths.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: apply PR20 migration.
- Vercel: verify CTA and linked-discussion flows in preview.
- Repo A: unchanged.

## Acceptance criteria
1. Newsletter entry can start a linked forum thread.
2. Linked thread stores `source_newsletter_id`.
3. Discussions can be discovered by newsletter linkage.
4. Baseline verification commands pass.
5. Docs include new interface and verification details.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - Newsletter CTA -> prefilled thread -> publish -> linked discussion visible.

## Risks and mitigations
- Risk: link field could break existing post selects.
- Mitigation: update select mappers and keep field nullable.

## Rollback/backout approach
- Revert app changes.
- Keep nullable column if rollback happens post-deploy, or apply rollback migration if required.
