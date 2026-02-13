const LOCAL_DEV_ORIGIN = "http://localhost:3000";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSiteUrl() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  const isHostedProduction = process.env.VERCEL_ENV === "production";
  if (!isHostedProduction) {
    return LOCAL_DEV_ORIGIN;
  }

  throw new Error("Missing environment variable: NEXT_PUBLIC_SITE_URL");
}

export function toAbsoluteUrl(path: string) {
  const base = getSiteUrl();
  if (!path || path === "/") {
    return `${base}/`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getSitemapThreadLimit() {
  const raw = Number.parseInt(process.env.SITEMAP_THREAD_LIMIT ?? "200", 10);
  if (!Number.isFinite(raw)) {
    return 200;
  }

  return Math.max(10, Math.min(1000, raw));
}
