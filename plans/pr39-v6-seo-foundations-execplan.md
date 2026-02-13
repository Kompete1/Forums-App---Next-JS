# PR39 ExecPlan: SEO Foundations (Robots, Sitemap, Metadata, Social Previews)

## Summary
Add launch-grade SEO basics so public pages are crawlable and shareable, while private/operator surfaces are discouraged from indexing.

## Scope
- Add `robots.txt` via Next metadata route.
- Add `sitemap.xml` via Next metadata route.
- Add canonical URL environment support.
- Add site-wide Open Graph and Twitter defaults with image.
- Deepen page metadata for key public pages.
- Add explicit `noindex` metadata for private surfaces.
- Add SEO verification documentation and one e2e check.

## Non-goals
- No schema or RLS changes.
- No ranking strategy work (keywords/backlink/content plans).
- No third-party SEO plugin dependency.

## Public Contract Changes
- New env:
  - `NEXT_PUBLIC_SITE_URL` (canonical site origin).
  - Optional `SITEMAP_THREAD_LIMIT` (default 200; clamped).
- New public routes:
  - `/robots.txt`
  - `/sitemap.xml`

## Implementation Steps
1. Add SEO URL helper utilities under `web/src/lib/seo/`.
2. Update root metadata in `web/src/app/layout.tsx`:
   - `metadataBase`
   - title template
   - default `openGraph` and `twitter` with image
3. Add `web/src/app/robots.ts` and `web/src/app/sitemap.ts`.
4. Add page metadata upgrades:
   - `/`, `/forum`, `/categories`, `/resources`
   - dynamic metadata for `/forum/category/[slug]` and `/forum/[threadId]`
5. Add `noindex, nofollow` robots metadata to private surfaces:
   - `/admin`, `/moderation/reports`, `/notifications`, `/profile`, `/protected`, `/forum/new`, `/auth/*`
6. Add static social image under `web/public/social/`.
7. Add doc:
   - `web/docs/seo-verification.md`
   - link from `web/README.md` and `web/docs/operations-runbook.md`
8. Add e2e:
   - `web/tests/e2e/seo-foundations.spec.ts`
9. Run verification:
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e -- tests/e2e/seo-foundations.spec.ts`

## Acceptance Criteria
1. `/robots.txt` and `/sitemap.xml` are reachable and valid.
2. Robots includes sitemap URL and private path disallow entries.
3. Sitemap contains core routes, categories, and latest N threads.
4. Site-level OG/Twitter preview tags resolve with image URL.
5. Private routes carry non-index metadata.
6. SEO verification doc exists and is linked from active docs.
7. Lint/build/e2e pass.
