# PR19 ExecPlan: Forum UX Polish

## Summary
Polish forum discovery and thread-reading UX without changing authorization, data model behavior, or moderation boundaries.

## Goals
- Improve forum layout clarity on desktop and mobile.
- Reduce interaction friction in filters, search, and empty states.
- Improve thread-detail readability and navigation.
- Keep all current auth/RLS behavior unchanged.

## Non-goals
- No new Supabase tables or policy changes.
- No newsletter-thread linking in this PR.
- No attachments or admin dashboard work in this PR.

## Assumptions and open questions
- Assumption: current IA (`/forum`, `/forum/category/[slug]`, `/forum/[threadId]`) remains unchanged.
- Assumption: visual polish is additive and does not remove existing controls.
- Open question: none blocking.

## User journeys
1. Guest can filter/search threads and understand current filter state quickly.
2. Signed-in user can quickly find `Create thread` action from discovery pages.
3. Reader can scan thread details and jump to reply form with less friction.

## Interfaces and data model
- No DB schema changes.
- No API signature changes.
- UI-only updates in:
  - `web/src/app/forum/page.tsx`
  - `web/src/app/forum/category/[slug]/page.tsx`
  - `web/src/app/forum/[threadId]/page.tsx`
  - related components and style tokens in `web/src/app/globals.css`.

## Authorization/RLS policy plan
- No policy changes.
- Existing ownership/moderation rules remain source of truth.

## Step-by-step implementation plan
1. Add active filter summary row and clearer empty-state actions in thread feeds.
2. Improve CTA placement for create-thread flow across breakpoints.
3. Refine thread detail spacing/sections and add jump-to-reply affordance.
4. Tighten responsive behavior for filter rail and cards.
5. Validate no behavioral regressions in posting/reply/report flows.
6. Update docs:
   - `SPEC.md`
   - `docs/ARCHITECTURE.md`
   - `web/README.md`
   - `web/docs/testing-manual.md`

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: preview sanity checks for `/forum` and `/forum/[threadId]`.
- Repo A: unchanged.

## Acceptance criteria
1. Discovery pages have clearer filter/search states and empty-state guidance.
2. Thread detail page is easier to scan and navigate.
3. `npm run lint`, `npm run build`, and `npm run test:e2e` pass.
4. Docs reflect PR19 UX changes and verification steps.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - Desktop and mobile checks on `/forum`, `/forum/category/[slug]`, `/forum/[threadId]`.

## Risks and mitigations
- Risk: UX refactors could hide existing controls.
- Mitigation: explicit manual regression checklist for create/reply/report/mod actions.

## Rollback/backout approach
- Revert PR19 commits.
- No data rollback required.
