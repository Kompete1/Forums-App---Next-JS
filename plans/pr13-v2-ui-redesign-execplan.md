# PR13 ExecPlan: South African Motorsport UI/UX Redesign

## Summary
Implement a full UI/UX refresh for the forum app so it is easier to read, visually modern, and clearly positioned for South African motorsport enthusiasts, while preserving all existing auth, RLS, moderation, and newsletter functionality.

## Goals
- Replace bland/default UI with a consistent design system (color, type, spacing, hierarchy).
- Add a motorsport-themed landing page with hero slideshow support.
- Restructure forum browsing into a clearer information architecture:
  - `/` landing
  - `/forum` discovery/list page
  - `/forum/[threadId]` thread detail/discussion page
- Add baseline search and pagination to forum discovery.
- Seed and standardize SA motorsport categories, including sim racing.

## Non-goals
- No change to RLS authority model.
- No hide/remove moderation workflow in this PR.
- No storage-backed image upload UI in this PR.

## Assumptions and Open Questions
- Assumption: hero media is static local assets for now.
- Assumption: app remains light-first theme for readability.
- Assumption: category rename from `general` to `general-paddock` is safe because thread references use `category_id`.

## User Journeys
1. Guest lands on `/`, sees SA motorsport positioning, browses categories, enters forum.
2. Guest browses `/forum` and can filter by category, search text, and page through threads.
3. Authenticated user opens `/forum/[threadId]` and can reply/report.
4. Owner can edit/delete own thread on `/forum/[threadId]`.
5. Moderator/admin can lock/unlock threads and access reports.

## Interfaces and Data Model
- New route: `web/src/app/forum/[threadId]/page.tsx`.
- New route: `web/src/app/categories/page.tsx`.
- Expanded list query interface in thread data layer:
  - `categoryId`, `query`, `sort`, `page`, `pageSize`.
- New migration adds/normalizes categories:
  - `general-paddock`
  - `karting-discussions`
  - `main-circuit-discussions`
  - `rally-off-road-discussions`
  - `sim-racing-discussions`
  - `driver-development-and-licensing`
  - `events-and-track-days-sa`

## Authorization/RLS Policy Plan
- No new policy objects.
- Existing policies remain source of truth.
- UI gating remains convenience only.

## Step-by-step Implementation Plan
1. Add PR13 docs and migration metadata updates.
2. Build shared layout shell and visual design system.
3. Implement hero carousel and SA landing page.
4. Implement forum discovery page with search/filter/pagination.
5. Implement thread detail page and move detail-heavy actions there.
6. Apply visual updates to auth/newsletter/moderation pages.
7. Validate lint/build and manual role-sensitive flows.

## Manual Platform Steps (Supabase/Vercel/Repo A)
1. Run PR13 migration in Supabase SQL Editor after PR12 migration.
2. Verify category rows in `public.categories`.
3. Deploy to Vercel preview and validate mobile/desktop layout.
4. Repo A integration unchanged in this PR.

## Acceptance Criteria
1. App has a coherent SA motorsport visual identity and improved readability.
2. Landing page includes hero section with slideshow controls.
3. `/forum` supports category filter, text search, and pagination.
4. `/forum/[threadId]` supports replies/reporting and owner/mod actions as before.
5. Category list includes sim racing and all defined SA motorsport categories.
6. Existing moderation and newsletter authorization behavior is unchanged.

## Verification Steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
- Manual:
  - Guest browsing on `/`, `/forum`, `/forum/[threadId]`.
  - Auth create/edit/delete/reply/report flows.
  - Moderator lock/unlock and reports visibility.
  - Newsletter admin create and non-admin restriction.

## Risks and Mitigations
- Risk: UI refactor accidentally drops existing actions.
  - Mitigation: verify each legacy action on new pages.
- Risk: category rename drift in existing data.
  - Mitigation: migration is idempotent and non-destructive.
- Risk: search query performance.
  - Mitigation: keep scope to small page sizes and existing limits.

## Rollback/Backout
- Revert PR13 app/docs commits.
- If needed, keep new categories since migration is additive and safe; no destructive rollback required.
