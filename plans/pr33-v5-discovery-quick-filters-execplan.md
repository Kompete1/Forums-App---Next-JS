# PR33 ExecPlan: Discovery Quick Filters (Signal Chips as Controls)

## 1. Title
PR33 V5 Discovery Quick Filters

## 2. Summary
Implement a focused discovery UX slice that makes thread intelligence actionable via one-click quick filters (`Unanswered`, `Active`, `Popular`) on `/forum` and `/forum/category/[slug]`. Use URL state (`signal`) and server-side filtering in page loaders. No schema, RLS, or route changes.

## 3. Goals
- Convert PR32 signal labels into usable discovery controls.
- Keep quick-filter state shareable/bookmarkable via URL params.
- Preserve existing auth/RLS behavior and route contracts.

## 4. Non-goals
- No DB migrations or policy changes.
- No ranking/sorting algorithm changes.
- No multi-select signal combinations.
- No personalized discovery cues.

## 5. Assumptions and open questions
- Signal thresholds remain unchanged from PR32:
  - `Unanswered`: `repliesCount === 0`
  - `Active`: `last_activity_at <= 24h`
  - `Popular`: `repliesCount >= 5`
- Unsupported `signal` values fall back to `all`.
- Open questions: none blocking.

## 6. User journeys
1. User opens `/forum` and clicks `Unanswered` to quickly find threads that need replies.
2. User shares a link with `?signal=popular` and recipient lands in the same filtered state.
3. User navigates category discovery and applies the same quick-filter controls consistently.

## 7. Interfaces and data model
- URL contract extension (backward-compatible):
  - Optional `signal` query param on discovery routes.
  - Supported values: `unanswered`, `active`, `popular`.
- Existing params remain unchanged:
  - `category`, `q`, `newsletter`, `sort`, `page`
- Existing `ThreadSort` contract remains unchanged.
- Internal helper additions in `web/src/lib/ui/discovery-signals.ts`:
  - `SignalFilter` type
  - `parseSignalFilter`
  - `getSignalLabel`
  - `matchesSignalFilter`

## 8. Authorization/RLS policy plan
- No changes.
- Discovery remains public read; all existing write/auth boundaries stay intact.

## 9. Step-by-step implementation plan
1. Add this PR33 plan doc.
2. Extend discovery signal helper module with URL-safe signal parsing and labeling helpers.
3. Add server-side signal filtering in `/forum` page loader.
4. Add server-side signal filtering in `/forum/category/[slug]` page loader.
5. Add quick-filter controls to `ForumFilterPanel` (`All`, `Unanswered`, `Active`, `Popular`) with explicit active state.
6. Ensure URL/state preservation across filter, clear, pagination links.
7. Update discovery context line to include selected signal label.
8. Add targeted Playwright spec for quick-filter URL + semantics checks.
9. Update docs (`SPEC.md`, `README.md`, `web/README.md`, `web/docs/testing-manual.md`).
10. Run verification (`lint`, `build`, targeted e2e, full e2e) and record outcomes.

## 10. Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: preview smoke check of quick filters and URL state.
- Repo A: unchanged.

## 11. Acceptance criteria
1. Quick-filter controls render on `/forum` and `/forum/category/[slug]`.
2. URL includes `signal` and preserves state across navigation.
3. Filtering executes server-side and displayed totals/pages align with filtered results.
4. No DB/RLS or route contract changes are introduced.
5. Docs sync contract is fully satisfied for PR33.
6. Lint/build/targeted e2e pass; full e2e run is reported.

## 12. Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e -- tests/e2e/discovery-quick-filters.spec.ts`
  - `npm run test:e2e`
- Manual:
  - Verify quick filter controls and active states on both discovery surfaces.
  - Confirm `signal` behavior with combined params (`sort`, `q`, `category`, `newsletter`).
  - Confirm mobile wrapping/readability.

## 13. Risks and mitigations
- Risk: filtering with pagination can create inconsistent totals.
  - Mitigation: compute filtered result set server-side before display pagination.
- Risk: URL-state regressions with existing params.
  - Mitigation: centralized href builders and targeted e2e checks for `signal`.
- Risk: visual clutter in filter rail.
  - Mitigation: compact chip controls with explicit active state.

## 14. Rollback/backout approach (if applicable)
- Revert PR33 UI/docs commits.
- No database rollback required.

## Decision log
- Scope chosen: discovery quick filters only (single-purpose PR).
- URL contract chosen: single `signal` param.
- Filtering chosen: server-side page loader filtering.
- Surface chosen: `/forum` and `/forum/category/[slug]`.
- Test depth chosen: one targeted new e2e spec plus full-suite run.
