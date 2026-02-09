# UX Implementation Plan

## Scope Summary
Implement the forum UX redesign in small PR-sized milestones while preserving current security, auth boundaries, and RLS behavior. Stable routes remain unchanged.

## Proposal Source
- Primary proposal: `docs/ux-proposal.md`
- Product baseline: `SPEC.md`
- Architecture boundaries: `docs/ARCHITECTURE.md`

## Tooling Recommendations

### shadcn/ui (Radix-based primitives)
- Why: accessible and keyboard-ready primitives for header menu and report modal without writing custom accessibility logic.
- Install steps:
  1. `cd web`
  2. `npm i @radix-ui/react-dropdown-menu @radix-ui/react-dialog`
  3. Add shared UI wrappers under `web/src/components/ui/`.
- Components used for:
  - Avatar/user dropdown menu in header
  - Report modal/dialog actions on thread detail page
- Risks/tradeoffs:
  - Requires CSS alignment with existing token system.
  - Slight bundle increase.
- PR timing: PR2 (foundational).

### Sonner (toasts)
- Why: consistent transient feedback for auth/report/reply flows.
- Install steps:
  1. `cd web`
  2. `npm i sonner`
  3. Mount `<Toaster />` in `web/src/app/layout.tsx`.
- Components used for:
  - User feedback on actions that currently only show inline messaging.
- Risks/tradeoffs:
  - Toast overload risk if not curated.
- PR timing: PR2.

### Optional deferred: react-hook-form + zod
- Why: better client form ergonomics and reusable validation schemas.
- Install steps:
  - `npm i react-hook-form zod @hookform/resolvers`
- Use targets:
  - Thread/reply/report forms if refactor needed later.
- Risks/tradeoffs:
  - Medium refactor scope across server actions.
- PR timing: deferred after core UX ship.

### Optional deferred: Tiptap
- Why: richer thread/reply authoring.
- Install steps:
  - `npm i @tiptap/react @tiptap/starter-kit`
- Use targets:
  - Thread and reply composer.
- Risks/tradeoffs:
  - High implementation and QA complexity.
- PR timing: deferred future slice.

### Data and fetching standard
- Keep current server components + server actions pattern.
- No query library adoption in this redesign slice.

### Testing standard
- Keep Playwright for E2E.
- Keep lint/build as required checks.
- Add focused tests for auth returnTo and activity sorting.

## PR1: Docs Baseline + UX Contract

### Goal
Freeze scope, acceptance criteria, and design tokens before runtime changes.

### Files/components
- `docs/ux-proposal.md`
- `docs/ux-implementation-plan.md`
- `docs/design-tokens.md`
- `SPEC.md`
- `README.md`
- `web/README.md`

### DB changes
- None.

### Acceptance criteria
- Five required UX behaviors are explicitly documented.
- PR-by-PR scope, risks, and rollback notes are documented.

### Automated tests
- None.

### Rollback
- Revert docs only.

## PR2: Foundations (Tokens + Header Menu + Auth returnTo)

### Goal
Ship global UX foundations and correct login redirect behavior.

### Files/components likely to change
- `web/src/components/site-header.tsx`
- `web/src/app/auth/login/page.tsx`
- `web/src/app/forum/new/page.tsx`
- `web/src/app/forum/[threadId]/page.tsx`
- `web/src/app/notifications/page.tsx`
- `web/src/app/layout.tsx`
- `web/src/app/globals.css`
- `web/src/components/ui/dropdown-menu.tsx`
- `web/src/components/ui/dialog.tsx`
- `web/src/components/ui/avatar-badge.tsx`
- `web/src/lib/ui/auth-return-to.ts`

### DB changes
- None.

### Acceptance criteria (manual)
1. Open `/auth/login`, sign in, and confirm redirect to `/forum`.
2. Open create thread while signed out, sign in, and confirm redirect to target create screen.
3. Open thread as guest, use reply login CTA, sign in, and confirm return to same thread with reply composer visible.
4. Header shows clear signed-in state with avatar menu, `Profile`, and `Logout`.

### Automated tests to add/update
- `web/tests/e2e/forum-create-thread-auth-flow.spec.ts`
  - direct login -> `/forum`
  - login from create CTA returns to `/forum/new?...`
  - login from reply CTA returns to `/forum/<id>` and composer anchor

### Rollback
- Revert PR2 code changes.

## PR3: Forum and Category Readability Refresh

### Goal
Improve scanability and consistent metadata hierarchy for discovery lists.

### Files/components likely to change
- `web/src/components/thread-feed-list.tsx`
- `web/src/components/forum-filter-panel.tsx`
- `web/src/app/forum/page.tsx`
- `web/src/app/forum/category/[slug]/page.tsx`
- `web/src/app/categories/page.tsx`
- `web/src/app/globals.css`

### DB changes
- None.

### Acceptance criteria (manual)
1. Thread cards have clear title/snippet/meta/activity structure.
2. Category and forum list views remain usable on mobile.
3. Create-thread CTA remains obvious in discovery pages.

### Automated tests to add/update
- Extend discovery/auth flow checks to assert CTA visibility and list semantics.

### Rollback
- Revert PR3 code changes.

## PR4: Thread Detail Reflow + Report Modal

### Goal
Prioritize reading and replying; make reporting secondary action.

### Files/components likely to change
- `web/src/app/forum/[threadId]/page.tsx`
- `web/src/components/thread-report-actions.tsx`
- `web/src/components/reply-report-actions.tsx`
- `web/src/components/ui/dialog.tsx`
- `web/src/app/globals.css`

### DB changes
- None.

### Acceptance criteria (manual)
1. No large inline report forms dominate thread/reply content.
2. Report action opens a modal (or secondary report view).
3. Reply composer is visible and easy to reach.

### Automated tests to add/update
- Add report modal open/submit coverage.
- Ensure reply flow still passes.

### Rollback
- Revert PR4 code changes.

## PR5: Last Activity Sorting (Reply Bump)

### Goal
Sort threads by recent activity and bump thread ordering on new reply.

### Files/components likely to change
- `web/supabase/migrations/<timestamp>_prXX_thread_last_activity.sql`
- `web/src/lib/db/posts.ts`
- `web/supabase/verification/prXX_thread_last_activity_checks.sql`
- `web/tests/e2e/forum-activity-sorting.spec.ts`

### DB changes
- Add `posts.last_activity_at timestamptz not null default created_at`.
- Backfill with greatest post creation and latest reply creation.
- Add trigger on `replies` insert to update parent post `last_activity_at`.
- Add index for efficient ordering by `last_activity_at`.
- Keep RLS policies unchanged.

### Migration plan
1. Add column with default.
2. Backfill existing rows.
3. Create trigger function + trigger.
4. Add index.
5. Verify with SQL checks.

### Acceptance criteria (manual)
1. Forum and category pages default to recent activity order.
2. Replying to an older thread bumps it to the top.

### Automated tests to add/update
- Create two threads, reply on older thread, verify ordering bump.

### Rollback
- Code rollback to `created_at` sort fallback.
- Migration rollback optional; column can be left unused safely.

## PR6: Notifications/Newsletter Consistency + A11y/Responsive Pass

### Goal
Align remaining pages with global UX language and accessibility baseline.

### Files/components likely to change
- `web/src/app/notifications/page.tsx`
- `web/src/app/newsletter/page.tsx`
- `web/src/app/profile/page.tsx`
- shared styles/components in `web/src/app/globals.css`

### DB changes
- None.

### Acceptance criteria (manual)
1. Signed-in state remains obvious across pages.
2. Notification and newsletter page controls are consistent with global components.
3. Mobile layouts avoid clipping and preserve keyboard usability.

### Automated tests to add/update
- Extend notifications e2e for menu-based access and read actions.

### Rollback
- Revert PR6 code changes.

## PR7: Testing Expansion and Closeout

### Goal
Lock regression coverage for core UX requirements.

### Files/components likely to change
- `web/tests/e2e/forum-create-thread-auth-flow.spec.ts`
- `web/tests/e2e/forum-activity-sorting.spec.ts`
- `web/tests/e2e/forum-thread-reporting.spec.ts`
- `web/docs/testing-manual.md`
- `web/README.md`
- `SPEC.md`

### DB changes
- None.

### Acceptance criteria (manual + automated)
- Minimum required automated tests pass:
  - auth redirect returnTo
  - create thread flow
  - reply flow
  - thread sorting bump-on-reply

### Rollback
- Revert flaky test additions while preserving runtime behavior.
