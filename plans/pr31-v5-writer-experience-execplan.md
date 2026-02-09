# PR31 ExecPlan: Writer Experience Upgrade (Markdown + Quote + Drafts)

## Summary
Implement a focused UX slice to improve writing quality and reduce contribution loss: markdown authoring tools, reliable preview improvements, quote-reply shortcuts, and local draft autosave/recovery for thread and reply flows.

## Goals
- Improve post/reply readability by making structure easy to author.
- Reduce drop-off from accidental refresh/navigation via autosaved drafts.
- Speed up participation with one-click quote reply.
- Preserve current auth/RLS and route boundaries.

## Non-goals
- No WYSIWYG editor.
- No DB schema or policy changes.
- No discovery ranking/search algorithm changes.

## Assumptions and open questions
- Markdown remains plain-text source of truth in existing `body` fields.
- `NEXT_PUBLIC_ENABLE_MARKDOWN_PREVIEW=1` is used for staging QA when preview is required.
- Drafts are local-only and scoped by route context.
- Open question: none blocking.

## User journeys
1. User formats content quickly via toolbar buttons instead of memorizing syntax.
2. User previews markdown including links and fenced code blocks before posting.
3. User quotes an existing reply into composer in one click.
4. User refreshes mid-write and restores draft with one action.
5. User successfully submits and stale draft is cleared.

## Interfaces and data model
- No server API changes.
- Existing form payloads unchanged (`title`, `body`, etc.).
- New client utilities:
  - `DraftPayload` local type `{ body, title?, updatedAt }`
  - draft storage helper functions
  - reusable `useDraftAutosave` hook.

## Authorization/RLS policy plan
- No changes.
- Existing reporting/moderation/ownership boundaries remain source of truth.

## Step-by-step implementation plan
1. Add draft storage utilities and reusable autosave hook.
2. Add markdown toolbar component and selection-aware insertion helpers.
3. Expand markdown preview parser for links and fenced code blocks.
4. Integrate toolbar + autosave + restore/discard banners into create-thread and reply composers.
5. Add quote action on replies that injects markdown quote into reply composer and focuses input.
6. Add pending-success draft cleanup logic to avoid stale drafts after successful submit redirects.
7. Update docs (`SPEC.md`, `web/README.md`, `web/docs/testing-manual.md`) and add PR31 plan references.
8. Validate lint/build/e2e + manual writer-flow checks.

## Manual platform steps (Supabase/Vercel/Repo A)
- Supabase: none.
- Vercel: validate toolbar/preview/quote/draft behavior in preview deployment.
- Repo A: unchanged.

## Acceptance criteria
1. Markdown toolbar inserts syntax at cursor/selection for thread and reply composers.
2. Preview supports headings/lists/quotes/bold plus links and fenced code blocks.
3. Reply quote action appends quote block to composer and focuses textarea.
4. Drafts auto-save (600ms debounce), restore/discard UI appears when applicable, and beforeunload guard only triggers for unsaved changes.
5. Successful submit paths clear stale drafts.
6. Lint/build/e2e pass and role-sensitive flows remain unchanged.

## Verification steps
- From `web/`:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Manual:
  - thread create/reply with toolbar + preview
  - quote reply injection and focus
  - refresh and restore/discard draft paths
  - submit success + error path draft behavior

## Risks and mitigations
- Risk: cursor insertion bugs in toolbar helpers.
  - Mitigation: centralize insertion helpers and run targeted manual checks for each button.
- Risk: stale local drafts after redirect.
  - Mitigation: pending-clear markers and route-aware cleanup logic.
- Risk: markdown preview mismatch.
  - Mitigation: document supported markdown subset and keep parsing deterministic.

## Rollback/backout approach
- Revert PR31 UI commits.
- No DB rollback needed.
