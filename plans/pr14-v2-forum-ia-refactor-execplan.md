# PR14 ExecPlan: Forum IA Refactor (Threads-First)

## Summary
Refactor forum information architecture after PR13 foundations to a threads-first browsing model with dedicated creation and profile routes.

## Scope
- Keep `/forum` focused on thread discovery.
- Add dedicated thread creation route `/forum/new`.
- Add category-scoped discovery route `/forum/category/[slug]`.
- Add profile route `/profile` for display-name/account settings.
- Preserve existing auth/RLS/moderation behavior.

## Acceptance Criteria
1. `npm run lint` and `npm run build` pass in `web/`.
2. `/forum` presents threads-first discovery and links into category views.
3. `/forum/new` allows authenticated thread creation.
4. `/forum/category/[slug]` displays category-scoped thread feeds.
5. `/profile` supports account/profile UX without policy regressions.

## Verification
- Manual browse checks on `/forum`, `/forum/new`, `/forum/category/<slug>`, `/profile`.
- Confirm owner/mod/reporting actions remain functional on `/forum/[threadId]`.
