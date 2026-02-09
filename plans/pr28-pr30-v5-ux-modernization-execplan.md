# PR28-PR30 ExecPlan: UX Modernization (Readability, Contribution, Engagement)

## Summary
Implement a phased UX modernization aligned to `UX Proposal.md` focused on: denser discovery readability, clearer thread hierarchy, lower posting friction, improved notifications surfaces, profile activity visibility, and baseline theming/accessibility hardening.

## Goals
- Improve forum/category scanability with denser thread rows.
- Reflow thread detail page so reading/replying are primary and reporting is secondary.
- Improve create/reply contribution flow with validation cues, counters, and attachment previews.
- Add notification bell dropdown preview + quick actions while keeping `/notifications` as archive.
- Add profile activity tab (my threads, my replies, recent notifications).
- Add optional theme toggle (light/dark) via design tokens.
- Keep existing auth/RLS authority model and route IA unchanged.

## Non-goals
- No RLS policy rewrites.
- No route IA rewrite.
- No full realtime personalization feed.
- No auth modal replacement for route-based login.
- No deep faceted search rollout in this slice.

## Assumptions and open questions
- `returnTo` remains source of truth for interruption redirects.
- Reply interruption should return to `/forum/<threadId>#reply-composer`.
- Rich text remains optional/feature-gated; markdown-lite hints are acceptable if full editor is deferred.
- Open question: none blocking implementation.

## User journeys
1. Guest tries to reply, logs in, and lands back at reply composer anchor.
2. Reader scans `/forum` and `/forum/category/[slug]` quickly with denser row metadata.
3. Reader navigates thread via breadcrumbs and focuses on content/replies first.
4. Signed-in user sees bell dropdown for recent notifications and can mark all read quickly.
5. Signed-in user opens profile and reviews own activity context in one place.
6. User can toggle theme without breaking readability or contrast.

## Interfaces and data model
- UI behavior update: guest reply CTA links to login with `returnTo=/forum/<threadId>#reply-composer`.
- Add breadcrumb rendering on thread detail route.
- Add header notification dropdown surface powered by existing `notifications` table reads.
- Add profile activity read functions (threads/replies/notifications) using existing tables.
- No schema migrations required for this slice.

## Authorization/RLS policy plan
- Preserve all existing policies.
- Use existing recipient-scoped notifications reads.
- Use existing ownership/moderation checks for thread actions.
- No new privileged write paths.

## Step-by-step implementation plan
1. Discovery/UI density refresh (`ThreadFeedList`, filter rail collapse, header grouping/icons).
2. Thread detail reflow (breadcrumbs, action de-emphasis, reply-primary composition flow).
3. Contribution polish (counters, inline guidance, sticky actions, attachment preview/removal).
4. Notifications surfaces (header bell dropdown + existing archive page refinements).
5. Profile activity tab and summary cards.
6. Theme toggle and tokenized light/dark styling + a11y focus pass.
7. Test and docs closeout.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: no new migration required.
- Vercel: validate header dropdown, thread layout, and theme toggle in preview.
- Repo A: unchanged.

## Acceptance criteria
1. Reply auth interruption returns to `/forum/<threadId>#reply-composer`.
2. `/forum` and `/forum/category/[slug]` show denser, easier-to-scan thread rows.
3. Thread detail hierarchy emphasizes reading/replying; report actions remain secondary/modal.
4. Header shows bell dropdown preview + quick path to mark all read.
5. Profile includes activity tab for threads/replies/notifications.
6. Theme toggle works and focus/contrast remain accessible.
7. Lint/build/e2e pass and manual RLS-sensitive flows remain valid.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - Thread reply login bounce with composer anchor.
  - Header bell dropdown interactions and notification page consistency.
  - Desktop/mobile readability checks for discovery and thread detail.
  - Theme toggle persistence behavior.

## Risks and mitigations
- Risk: UI refactor could hide role-sensitive actions.
  - Mitigation: explicit manual role checks for owner/mod controls.
- Risk: client-side attachment preview could diverge from server validation.
  - Mitigation: keep server-side validation as source of truth and show same constraints inline.
- Risk: header dropdown complexity could regress nav behavior.
  - Mitigation: keep archive page canonical and provide fallback links.

## Rollback/backout approach
- Revert UX commits by slice.
- No DB rollback needed.
- Preserve additive helper functions even if unused temporarily.
