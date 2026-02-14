# PR41 ExecPlan: Community Trust and Authority Scaffolding

## Summary
Add visible governance and trust scaffolding to the public forum experience by shipping Community Guidelines and Moderation policy pages, site-wide footer links, and explicit unofficial-site + escalation messaging.

## What changed
- Added public routes:
  - `/community-guidelines`
  - `/moderation-policy`
- Added shared site footer with trust links and escalation contact.
- Added optional policy links to signed-in account menu.
- Added SEO discoverability entries in sitemap.
- Added e2e smoke coverage for trust pages/footer/disclaimer.
- Updated docs and status pointers for PR41.

## Why it changed
- Improve community trust via predictable governance and transparent moderation expectations.
- Clarify the boundary between community discussion and official motorsport authorities.
- Reduce moderation ambiguity/conflict by publishing enforcement and appeal pathways.

## Assumptions
- Site remains unofficial community-operated platform.
- Official-source navigation is centralized via `/resources`.
- Response times are targets, not guarantees.
- Escalation mailbox: `peterj.swartz@outlook.com`.

## Implementation outline
1. Add governance pages with explicit behavior and moderation policies.
2. Add unobtrusive global footer and policy links.
3. Update account menu with policy links.
4. Update sitemap entries for new public pages.
5. Update docs (`SPEC.md`, root `README.md`, `web/README.md`, `web/docs/testing-manual.md`).
6. Run lint/build/e2e checks.

## Verification
From `web/`:
- `npm run lint`
- `npm run build`
- `npm run test:e2e -- tests/e2e/trust-governance.spec.ts`
- `npm run test:e2e -- tests/e2e/seo-foundations.spec.ts`

Manual:
- Verify footer visibility/links on `/`, `/forum`, `/resources`.
- Verify trust pages are readable on mobile.
- Verify account menu policy links when signed in.

## Risks and follow-up
- Risk: policy language may need legal/ops refinement later.
- Risk: published response expectations may drift if moderation bandwidth changes.
- Follow-up: periodically review guideline clarity and align with moderation outcomes.

## Rollback
- Revert PR41 files and redeploy previous build.
