# PR38 ExecPlan: Resources Hub Replacing Newsletter UX

## Summary
Replace the user-facing Newsletter section with a low-maintenance Resources hub for South African racers.

This PR introduces a canonical `/resources` route with curated official links and checklist templates, updates primary navigation and internal links to use Resources, and keeps `/newsletter` backward-compatible via permanent redirect.

## Scope
- Add `/resources` page with structured, low-maintenance sections:
  - Official notices & schedules
  - Calendars
  - Karting essentials
  - Track guides
  - Templates
- Replace primary nav item label/path from `Newsletter` to `Resources`.
- Add permanent redirect from `/newsletter` -> `/resources`.
- Keep route-level redirect fallback in `/newsletter` page file.
- Update current-state docs to treat Resources as canonical user-facing section name.
- Add guest e2e test for `/resources`.

## Non-Goals
- No migration away from `public.newsletters` in this PR.
- No schema, RLS, or data model changes.
- No changes to historical thread-newsletter linkage behavior:
  - `source_newsletter_id` remains unchanged.
  - `/forum?newsletter=<id>` filtering remains unchanged.
  - `/forum/new?fromNewsletter=<id>` flow remains unchanged.

## Assumptions
- `/newsletter` should remain accessible only as a compatibility entrypoint and redirect immediately.
- Resources content should prioritize official sources and avoid copied schedule data.
- Existing newsletter-backed discovery/thread metadata remains valid historical context.

## Implementation Steps
1. Add new route:
   - `web/src/app/resources/page.tsx`
   - include route metadata (`title`, `description`, Open Graph, Twitter).
2. Update top navigation:
   - `web/src/components/site-header.tsx` from Newsletter to Resources.
3. Add compatibility redirects:
   - `web/next.config.ts` permanent redirect `/newsletter` -> `/resources`.
   - `web/src/app/newsletter/page.tsx` route-level redirect fallback.
4. Update direct internal links from `/newsletter` to `/resources`:
   - admin quick action.
   - thread source backlink.
5. Update docs for canonical naming in current-state references:
   - `docs/ARCHITECTURE.md`
   - `docs/ux-proposal.md`
   - `web/README.md`
   - `web/docs/testing-manual.md`
   - `web/docs/operations-runbook.md`
6. Add e2e:
   - `web/tests/e2e/resources-guest.spec.ts`
7. Verify:
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e -- tests/e2e/resources-guest.spec.ts`

## Acceptance Criteria
1. Primary nav shows `Resources` and links to `/resources`.
2. `/resources` renders all required sections for guest users.
3. `/newsletter` permanently redirects to `/resources`.
4. Direct internal links previously targeting `/newsletter` now target `/resources`.
5. Guest e2e test confirms `/resources` loads and key heading content is visible.
6. Lint, build, and targeted e2e pass.

## Verification Checklist
- Guest visit `/resources` and confirm:
  - `Resources` heading visible
  - all five section headings visible
- Visit `/newsletter` and confirm redirect to `/resources`.
- Verify admin quick link and thread source backlink route to `/resources`.
- Spot-check outbound official links open expected sources.
