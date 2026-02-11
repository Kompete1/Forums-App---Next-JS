# UX Implementation Plan (Current)

## Scope Summary
Implement PR36 as a pragmatic UX gap-close on top of the already-delivered V5 modernization baseline. Preserve current security boundaries, auth flow contracts, RLS behavior, and route structure.

## Source of Truth
- Proposal/status ledger: `docs/ux-proposal.md`
- Product baseline: `SPEC.md`
- Architecture boundaries: `docs/ARCHITECTURE.md`

## Already Delivered Before PR36
- Header signed-in state with avatar dropdown and notification bell preview.
- `returnTo` auth redirect behavior for interrupted write flows.
- Thread report/reply report modal actions.
- Reply-first thread detail hierarchy with breadcrumbs.
- Draft autosave/restore for thread and reply composition.
- Discovery quick filters and signal chips.
- Last-activity sorting with reply bump behavior.
- Theme tokenization and toggle.

## PR36 Objectives
1. Light dual-state homepage on `/`:
   - guest CTA-first module
   - signed-in "Your recent activity" module
2. Category thread-count badges on `/` and `/categories`.
3. Compact nav icons for primary links while preserving text labels.
4. Accessibility pass:
   - skip link
   - stateful theme toggle `aria-label`
   - reduced-motion CSS handling

## Non-Goals for PR36
- Login/signup modals for contribution interruption.
- Full WYSIWYG editor adoption.
- Nested reply tree or follow/unfollow model.
- Advanced faceted search requiring schema changes.

## Implementation Slices

### Slice A: Docs and Planning Sync
Files:
- `docs/ux-proposal.md`
- `docs/ux-implementation-plan.md`
- `plans/pr36-v5-ux-gap-close-execplan.md`
- `SPEC.md`
- `web/README.md`

Acceptance:
1. Proposal ledger reflects implemented/partial/deferred state with code evidence.
2. PR36 scope and deferrals are explicit.

### Slice B: Home and Category Discoverability
Files:
- `web/src/app/page.tsx`
- `web/src/app/categories/page.tsx`
- `web/src/lib/db/categories.ts`
- `web/src/app/globals.css`

Acceptance:
1. Guest `/` shows CTA-first account module.
2. Signed-in `/` shows recent activity module with thread/reply/notification shortcuts.
3. Category cards on `/` and `/categories` display thread counts.

### Slice C: Header and A11y Finish
Files:
- `web/src/components/site-header.tsx`
- `web/src/components/theme-toggle.tsx`
- `web/src/app/layout.tsx`
- `web/src/app/globals.css`

Acceptance:
1. Primary nav links include compact icons with text labels.
2. Keyboard users can tab to and use skip link to jump past header.
3. Theme toggle exposes stateful next-action `aria-label`.
4. Reduced-motion preference minimizes animations/transitions.

## Verification Plan

### Automated
- `npm run lint`
- `npm run build`
- `npm run test:e2e -- tests/e2e/pr36-home-a11y.spec.ts`

### Manual
1. Guest on `/`: confirm login/sign-up CTA module visible and no signed-in activity module.
2. Signed-in on `/`: confirm "Your recent activity" module lists recent threads/replies/notifications.
3. `/categories`: confirm thread-count badge on each category card.
4. Keyboard-only pass: first tab reaches skip link and focuses main content region on activation.
5. Toggle theme and confirm label changes between dark/light action text.
6. Validate nav icons and text remain readable on mobile.

## Rollback
- Revert PR36 code and docs changes only; no schema rollback needed.
