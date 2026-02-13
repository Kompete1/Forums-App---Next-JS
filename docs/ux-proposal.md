# Forum UX Proposal and Implementation Status (PR36)

This document is now the source of truth for UX proposal status in Repo B. It reconciles original recommendations against implemented behavior and defines what remains in scope for PR36.

## Scope Decision
- Delivery model: pragmatic gap-close only.
- Keep existing auth and route contracts.
- Focus on high-value, low-risk UX and accessibility improvements.

## Proposal Coverage Ledger

| Proposal Item | Status | Evidence | Decision |
| --- | --- | --- | --- |
| Avatar/menu signed-in header state | Implemented | `web/src/components/header-user-menu.tsx`, `web/src/components/site-header.tsx` | Keep current approach. |
| Global `New thread` CTA in header | Implemented | `web/src/components/site-header.tsx` | Keep current approach. |
| Login/sign-up return to intended destination (`returnTo`) | Implemented | `web/src/app/auth/login/page.tsx`, `web/src/lib/ui/auth-return-to.ts`, protected route redirects in `web/src/app/forum/new/page.tsx` and `web/src/app/forum/[threadId]/page.tsx` | Keep current approach. |
| Breadcrumb trail on thread detail | Implemented | `web/src/app/forum/[threadId]/page.tsx` | Keep current approach. |
| Thread report/reply report as secondary modal action | Implemented | `web/src/components/report-action-dialog.tsx`, `web/src/app/forum/[threadId]/page.tsx` | Keep current approach. |
| Reply-first thread layout hierarchy | Implemented | `web/src/app/forum/[threadId]/page.tsx` | Keep current approach. |
| Draft autosave/restore for thread/reply composition | Implemented | `web/src/hooks/use-draft-autosave.ts`, `web/src/components/create-thread-form.tsx`, `web/src/components/reply-composer.tsx` | Keep current approach. |
| Attachment previews and removal before submit | Implemented | `web/src/components/attachment-preview-list.tsx`, composer components | Keep current approach. |
| Notifications bell dropdown preview | Implemented | `web/src/components/header-notification-menu.tsx` | Keep current approach. |
| Notifications archive grouping/filters | Implemented | `web/src/app/notifications/page.tsx` | Keep current approach. |
| Profile activity tab | Implemented | `web/src/app/profile/page.tsx` | Keep current approach. |
| Discovery sorting by latest activity with bump-on-reply | Implemented | `web/src/lib/db/posts.ts`, migration `web/supabase/migrations/20260209_pr27_v5_thread_last_activity.sql`, tests in `web/tests/e2e/forum-activity-sorting.spec.ts` | Keep current approach. |
| Dark mode support | Implemented | `web/src/components/theme-toggle.tsx`, tokenized styles in `web/src/app/globals.css` | Keep current approach. |
| Navigation scanability via icons/grouping | Partial | group present in `web/src/components/site-header.tsx`; icon treatment was partial | Complete in PR36 with compact icons while preserving text labels. |
| Dual-state homepage (guest vs signed-in usefulness) | Partial | `/` exists but was not personalized for signed-in users in `web/src/app/page.tsx` | Complete in PR36 with light dual-state modules. |
| Category card metadata richness (thread counts) | Partial | category cards lacked count badges in `/` and `/categories` | Complete in PR36 by adding thread counts to category data and cards. |
| Inline validation strictness and sticky actions | Partial | counters/constraints exist in composers but no full strict disable flow | Keep existing behavior; no hard disable rewrite in PR36. |
| Accessibility finish pass (skip link/reduced motion refinements) | Partial | focus-visible states exist in `web/src/app/globals.css`; skip link and reduced-motion treatment were missing | Complete in PR36. |
| Login/register modal interruptions for guest actions | Deferred by design | existing returnTo + draft retention already solves interruption risk | Do not add auth modals in PR36. |
| Full WYSIWYG editor | Deferred by design | markdown-lite toolbar/preview already shipped | Keep markdown-lite approach. |
| Nested reply tree | Deferred by design | flat replies + quote workflow already shipped | Keep flat timeline + quote in current slice. |
| Follow/unfollow system and feed by followed topics | Deferred by design | no follow model in current schema | Out of scope for PR36. |
| Heavy faceted search (author/date range/popularity matrix) | Deferred by design | current discovery filters and signal chips are active | Out of scope for PR36. |

## PR36 Remaining Feature Scope

### 1) Lightweight dual-state home
- Guest view:
  - Keep clear login/sign-up CTA.
  - Keep category and latest-thread discovery entry points.
- Signed-in view:
  - Add a "Your recent activity" module on `/`.
  - Include quick rows for recent threads, replies, and notifications.
  - Link to `/profile?tab=activity` and existing thread/notification routes.

### 2) Category discoverability upgrades
- Add thread-count badges to category cards on:
  - `/`
  - `/categories`
- Back category list with a category query that includes per-category thread count.

### 3) Header scanability improvements
- Add compact icons to primary nav links (`Forum`, `Categories`, `Resources`).
- Keep text labels for readability and accessibility.

### 4) Accessibility finish pass
- Add keyboard skip link targeting the main app content region.
- Improve icon-only control semantics where needed (theme toggle stateful label).
- Add reduced-motion CSS handling for users with motion sensitivity preference.

## Explicit Deferrals
- No auth modal interruption flow.
- No full rich-text/WYSIWYG dependency introduction.
- No nested replies or follow model.
- No schema expansion for advanced faceted search.
