# PR42 ExecPlan: Moderator/Admin Thread Pinning

## Summary
Add thread pinning controls for moderators/admins so pinned threads appear first in discovery feeds, including category pages, with clear UI state (`Pin` -> `Pinned`).

## What changed
- Added `posts` pinning fields and indexes (`is_pinned`, `pinned_at`, `pinned_by`).
- Added moderator/admin pin action support in server DB layer.
- Updated thread feed ordering to prioritize pinned threads.
- Added moderator/admin-only pin button in thread row aside with fixed-size stateful styling.
- Added migration verification SQL and docs updates.

## Why it changed
- Moderation needs lightweight curation controls to keep important threads visible.
- Category discovery should surface pinned threads first while preserving existing sort behavior underneath.

## Verification
From `web/`:
- `npm run lint`
- `npm run build`
- `npm run test:e2e -- tests/e2e/forum-guest.spec.ts`

Manual:
- mod/admin can pin and unpin from thread feed rows
- non-mod users do not see pin controls
- pinned threads rank above unpinned threads within discovery feeds
- multiple pinned threads in one category remain supported

## Risks and mitigations
- Risk: owner update policy changes may affect existing owner edits.
- Mitigation: owner policy still permits normal title/body/category edits; tests and manual checks included.

## Rollback
- Revert PR42 code and migration, then redeploy prior build.
