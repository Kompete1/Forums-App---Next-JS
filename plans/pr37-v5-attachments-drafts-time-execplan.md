# PR37 V5 Attachments, Draft Reliability, and Timestamp Standardization ExecPlan

## Goal
Fix three production UX defects without changing auth/RLS/schema boundaries:
1. Attachment images are cropped on thread/reply cards.
2. Reply drafts can remain flagged as restorable after successful submit.
3. Forum timestamps are inconsistent due to locale/timezone drift.

## In Scope
- Render posted attachments with full-image visibility (`contain`) on thread and reply cards.
- Make reply draft cleanup deterministic on successful submit with explicit success marker.
- Introduce shared forum datetime formatter locked to Africa/Johannesburg with 24-hour format `YYYY/MM/DD, HH:mm:ss`.
- Add/extend Playwright coverage for these behaviors.
- Update docs and status tracking.

## Out of Scope
- New schema/migrations/policies.
- Rich-text editor changes.
- Auth flow redesign.

## Files to Change
- Runtime:
  - `web/src/app/globals.css`
  - `web/src/app/forum/[threadId]/page.tsx`
  - `web/src/components/draft-submission-cleanup.tsx`
  - `web/src/lib/ui/date-time.ts` (new)
  - Any `toLocaleString()` forum timestamp render path in `web/src`
- Tests:
  - `web/tests/e2e/writer-flows.spec.ts`
- Docs:
  - `web/README.md`
  - `web/docs/testing-manual.md`
  - `SPEC.md`
  - `README.md`

## Public Interface Notes
- New UI utility: `formatForumDateTime(input: string | Date): string`.
- Reply success redirect marker: `replyPosted=1` query param on `/forum/[threadId]` success redirect.
- No route removals and no auth contract changes.

## Acceptance Criteria
1. Attachments displayed under thread/reply content do not crop source images.
2. After successful reply submit, `Draft found`/`Restore draft` is not shown for the submitted content.
3. On reply error path (cooldown/attachment error), draft remains recoverable.
4. Forum timestamp strings are consistently formatted as `YYYY/MM/DD, HH:mm:ss` in SAST (no AM/PM).
5. Lint/build and targeted e2e tests pass.

## Verification
From `web/`:
1. `npm run lint`
2. `npm run build`
3. `npm run test:e2e -- tests/e2e/writer-flows.spec.ts`

Manual add-ons:
1. Post wide and tall images and confirm full render + click-through full image.
2. Post reply successfully and confirm draft banner is gone.
3. Trigger reply rate-limit and confirm draft banner remains available.
4. Validate displayed times align with SAST and 24-hour format.

## Risks and Mitigations
- Risk: `replyPosted=1` remains in copied URL.
  - Mitigation: marker is harmless and only drives client-side cleanup.
- Risk: letterboxing with `contain` may reduce visual fill.
  - Mitigation: explicit choice to prioritize full-image visibility.
- Risk: converting all timestamp paths can miss a surface.
  - Mitigation: exhaustive `toLocaleString` search and replacement plus e2e format assertion.
