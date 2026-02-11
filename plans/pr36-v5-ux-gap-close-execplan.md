# PR36 V5 UX Gap Close ExecPlan

## Goal
Close the remaining high-value UX proposal gaps while preserving existing auth, RLS, and route contracts.

## In Scope
1. Dual-state homepage:
- guest CTA-first module
- signed-in recent activity module
2. Category card thread-count badges on `/` and `/categories`.
3. Header nav icon scanability improvements.
4. Accessibility finish pass:
- skip link
- stateful theme toggle label
- reduced-motion preference styles

## Out of Scope
- Auth interruption modals.
- Full WYSIWYG editor.
- Nested replies and follow system.
- New DB schema migrations.

## Files to Change
- Docs:
  - `docs/ux-proposal.md`
  - `docs/ux-implementation-plan.md`
  - `SPEC.md`
  - `web/README.md`
- App:
  - `web/src/lib/db/categories.ts`
  - `web/src/app/page.tsx`
  - `web/src/app/categories/page.tsx`
  - `web/src/components/site-header.tsx`
  - `web/src/components/theme-toggle.tsx`
  - `web/src/app/layout.tsx`
  - `web/src/app/globals.css`
- Tests:
  - `web/tests/e2e/pr36-home-a11y.spec.ts`

## Public Interface Impact
- No route removals or query param changes.
- No auth contract changes.
- `ForumCategory` includes `thread_count` for UI metadata display.

## Acceptance Criteria
1. Guest `/`:
- shows guest CTA module
- does not show signed-in activity module
2. Signed-in `/`:
- shows "Your recent activity" with links to existing resources
3. `/` and `/categories`:
- category cards include thread-count badges
4. Header:
- nav links keep text labels and show compact icons
5. Accessibility:
- keyboard-visible skip link reaches main content container
- theme toggle `aria-label` reflects next mode action
- reduced-motion media query is present and active

## Verification

### Automated
From `web/`:
1. `npm run lint`
2. `npm run build`
3. `npm run test:e2e -- tests/e2e/pr36-home-a11y.spec.ts`

### Manual
1. Keyboard-only pass across header and skip link.
2. Mobile viewport pass for nav readability and no clipping.
3. Reduced-motion preference check.

## Risks and Mitigations
- Risk: relation-count query shape variance in Supabase category response.
  - Mitigation: parse both object and array relation result shapes; default to `0`.
- Risk: skip-link focus target inconsistency.
  - Mitigation: stable `id="main-content"` target in root layout.
- Risk: auth e2e depends on local credentials.
  - Mitigation: auth test path skips when env vars are absent.
