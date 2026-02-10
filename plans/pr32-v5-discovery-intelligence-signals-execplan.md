# PR32 ExecPlan: Discovery Intelligence Signals (No Schema/RLS Changes)

## 1. Title
PR32 V5 Discovery Intelligence Signals

## 2. Summary
Deliver a focused discovery UX slice that improves thread scanning quality using existing thread and reply data only. Add computed signal chips (`Unanswered`, `Active`, `Popular`) and clearer sort/filter context on `/forum` and `/forum/category/[slug]` without route, schema, or RLS changes.

## 3. Goals
- Improve fast thread triage with compact quality/activity signals.
- Clarify current sort/filter/search context in discovery lists.
- Keep PR scope small, low risk, and reversible at UI level.

## 4. Non-goals
- No Supabase schema migrations or policy changes.
- No ranking algorithm or search relevance changes.
- No route contract changes.
- No personalized "my activity" discovery cues.

## 5. Assumptions and open questions
- Existing data is sufficient:
  - `last_activity_at` from posts
  - reply counts from `listRepliesByThreadIds`
- Signal thresholds are fixed defaults for PR32:
  - `Unanswered`: `repliesCount === 0`
  - `Active`: `last_activity_at <= 24h`
  - `Popular`: `repliesCount >= 5`
- Open questions: none blocking.

## 6. User journeys
1. Guest or signed-in user opens `/forum` and can immediately spot unanswered/active/popular threads.
2. User switches sorting and can clearly confirm current sort mode from discovery context text.
3. User opens `/forum/category/[slug]` and sees the same signal logic and sort clarity in scoped discovery.

## 7. Interfaces and data model
- Public interfaces unchanged:
  - Routes: `/forum`, `/forum/category/[slug]`
  - Query params: `category`, `q`, `newsletter`, `sort`, `page`
  - `ThreadSort`: `activity | newest | oldest`
- Internal additions:
  - `web/src/lib/ui/discovery-signals.ts` pure helper module:
    - `getThreadSignals({ repliesCount, lastActivityAt, now? })`
    - `getSortLabel(sort)`
  - `ThreadFeedList` optional prop: `contextLine?: string`

## 8. Authorization/RLS policy plan
- No changes.
- All discovery remains public read with existing auth/write boundaries intact.

## 9. Step-by-step implementation plan
1. Add this PR32 plan doc.
2. Add shared signal helper utilities in `web/src/lib/ui/discovery-signals.ts`.
3. Update `ThreadFeedList` to render computed signal chips while preserving existing lock/status/info pills.
4. Add explicit sort/filter/search context text on `/forum` and `/forum/category/[slug]`.
5. Add small selected-sort context text in filter panel UI (no new controls).
6. Add CSS for signal chip variants with light/dark-safe contrast.
7. Add one targeted Playwright spec for discovery signal/sort clarity behavior.
8. Update docs (`SPEC.md`, `README.md`, `web/README.md`, and `web/docs/testing-manual.md`).
9. Run verification commands and record exact outcomes.

## 10. Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: preview smoke of discovery chips and context copy.
- Repo A: unchanged.

## 11. Acceptance criteria
1. Signal chips render per locked thresholds on `/forum` and `/forum/category/[slug]`.
2. Sort context is explicit and visible on discovery surfaces.
3. Existing route/auth/RLS behavior is unchanged.
4. No DB migration/policy edits are introduced.
5. Docs sync requirements are complete for PR32.
6. `lint`, `build`, and targeted e2e pass (or deterministic skips are reported).

## 12. Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e -- tests/e2e/discovery-signals.spec.ts`
- Optional confidence:
  - `npm run test:e2e`
- Manual:
  - Verify signal chips and context text in both discovery surfaces.
  - Verify mobile wrapping and signed-in/signed-out parity.

## 13. Risks and mitigations
- Risk: signal labels may add visual noise.
  - Mitigation: compact pill styling and concise labels.
- Risk: seed variability for e2e signal assertions.
  - Mitigation: deterministic sort context assertion + conditional skip for unavailable fixture conditions.
- Risk: confusion over thresholds.
  - Mitigation: thresholds explicitly documented in plan and SPEC.

## 14. Rollback/backout approach (if applicable)
- Revert PR32 UI/docs commits.
- No DB rollback required.

## Decision log
- Chosen scope: discovery intelligence signals only (single-purpose PR).
- Chosen surfaces: `/forum` and `/forum/category/[slug]`.
- Chosen thresholds: unanswered=0 replies, active<=24h, popular>=5 replies.
- Chosen test depth: one targeted e2e spec plus lint/build.
