# SEO Verification (PR39)

This note covers quick production verification for `robots.txt`, `sitemap.xml`, and Search Console setup.

## 1) Verify robots.txt in production

1. Open `https://<your-domain>/robots.txt`.
2. Confirm:
   - crawl is allowed for public pages
   - private/operator paths are disallowed (`/admin`, `/moderation`, `/notifications`, `/profile`, `/protected`, `/forum/new`, `/auth`)
   - `Sitemap:` points to your production `/sitemap.xml` URL

## 2) Verify sitemap.xml in production

1. Open `https://<your-domain>/sitemap.xml`.
2. Confirm the XML loads without errors.
3. Confirm it includes core URLs:
   - `/`
   - `/forum`
   - `/categories`
   - `/resources`
4. Confirm category URLs are listed.
5. Confirm recent thread URLs are listed (up to `SITEMAP_THREAD_LIMIT`, default `200`).

## 3) Validate sitemap format

1. Use a sitemap validator or browser XML view to ensure it is well-formed.
2. Confirm each URL is absolute and uses your canonical origin (`NEXT_PUBLIC_SITE_URL`).

## 4) Submit sitemap to Google Search Console

1. Open Google Search Console for your verified property.
2. Go to **Sitemaps**.
3. Submit: `https://<your-domain>/sitemap.xml`.
4. Wait for initial processing and check for fetch/parse errors.

## 5) Use URL Inspection for crawl/index debugging

Inspect at least:
- one public page (`/`)
- forum discovery (`/forum`)
- one category page (`/forum/category/<slug>`)
- one thread page (`/forum/<threadId>`)
- one private page (`/admin` or `/profile`)

Expected:
- public pages are crawlable/indexable
- private pages are excluded or discouraged from indexing (`noindex` + robots disallow)
