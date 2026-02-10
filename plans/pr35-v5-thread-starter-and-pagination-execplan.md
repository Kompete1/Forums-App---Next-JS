# PR35 ExecPlan: Thread Starter Emphasis + Advanced Feed Pagination

## Summary
Implement a focused UX polish slice to improve thread-detail hierarchy and navigation for large discovery feeds:
1. Make the thread starter block visually stronger and less skippable versus Replies.
2. Align thread-starter reaction controls to the right, matching reply row action alignment.
3. Replace simple previous/next controls with advanced pagination on `/forum` and `/forum/category/[slug]`: page numbers, `Next`, `Last` (`>>`), and page-select jump.

## Goals
- Improve reading hierarchy in thread detail.
- Improve control alignment consistency between thread starter and replies.
- Improve navigation efficiency for multi-page feeds.
- Keep routes/query contracts stable with no DB/RLS changes.

## Non-goals
- No DB schema, migration, or RLS changes.
- No search/sort ranking logic changes.
- No route shape changes.
- No feature flags.

## Assumptions and open questions
- Advanced pagination appears only when `totalPages > 1`.
- Page number window defaults to current page +/-2.
- Tooltips:
  - `Next page`
  - `Last page`
- Open questions: none blocking.

## User journeys
1. User opens `/forum/[threadId]` and clearly recognizes thread starter as primary content.
2. User sees starter like controls aligned consistently with reply action clusters.
3. User on deep category/forum pages jumps directly to later pages using `Last` or page selector.

## Interfaces and data model
- No data model changes.
- `ThreadFeedList` interface adds pagination-href builder:
  - `pageHref: (targetPage: number) => string`
- Existing query params unchanged:
  - `page`, `sort`, `q`, `category`, `newsletter`, `signal`

## Authorization/RLS policy plan
- No changes.
- Existing auth/write boundaries remain unchanged.

## Step-by-step implementation plan
1. Add this PR35 plan doc.
2. Add shared pagination component in `web/src/components/pagination-controls.tsx`.
3. Update `ThreadFeedList` to consume `pageHref` and render advanced pagination controls.
4. Update `/forum` and `/forum/category/[slug]` pages to provide `pageHref` and preserve active query state.
5. Update thread detail header structure in `/forum/[threadId]` to emphasize thread starter and right-align starter reactions.
6. Add CSS for starter emphasis, alignment, and pagination visuals/tooltips.
7. Add targeted e2e coverage in `web/tests/e2e/pagination-controls.spec.ts`.
8. Update docs (`SPEC.md`, `README.md`, `web/README.md`, `web/docs/testing-manual.md`).
9. Run lint/build/targeted e2e/full e2e and report exact outcomes.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: preview QA for thread-detail hierarchy and pagination controls.
- Repo A: unchanged.

## Acceptance criteria
1. Thread starter block is visually stronger than before and reaction controls align right.
2. Advanced pagination renders on `/forum` and `/forum/category/[slug]` for multi-page feeds.
3. `Next` and `Last` controls include fixed tooltip copy.
4. Page-select jump updates URL to target page.
5. Existing query params are preserved while paging.
6. Lint/build/targeted e2e pass; full e2e run is reported.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e -- tests/e2e/pagination-controls.spec.ts`
  - `npm run test:e2e`
- Manual:
  - Confirm thread starter prominence/alignment on desktop and mobile.
  - Confirm forum/category pagination controls and page-jump behavior.
  - Confirm quick filters/sort/search/newsletter params survive paging.

## Risks and mitigations
- Risk: dropping active query params when generating page links.
  - Mitigation: central page href builders and e2e checks for preserved params.
- Risk: visual clutter from richer pagination.
  - Mitigation: compact windowed page links and responsive wrapping.
- Risk: starter emphasis changes hierarchy unexpectedly.
  - Mitigation: incremental typography/layout adjustments and responsive checks.

## Rollback/backout approach
- Revert PR35 UI/docs commits.
- No database rollback needed.

## Decision log
- Pagination scope: `/forum` and `/forum/category/[slug]`.
- Pagination model: numbered links + `Next` + `Last` + page-select jump.
- Thread starter controls aligned right to match reply pattern.
