import type { MetadataRoute } from "next";
import { listCategories } from "@/lib/db/categories";
import { listThreadsPage } from "@/lib/db/posts";
import { getSitemapThreadLimit, toAbsoluteUrl } from "@/lib/seo/site-url";

export const revalidate = 3600;

function baseEntries(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: toAbsoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: toAbsoluteUrl("/forum"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: toAbsoluteUrl("/categories"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: toAbsoluteUrl("/resources"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = baseEntries();

  try {
    const categories = await listCategories();
    for (const category of categories) {
      entries.push({
        url: toAbsoluteUrl(`/forum/category/${encodeURIComponent(category.slug)}`),
        lastModified: new Date(category.created_at),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch {
    // Keep core URLs even if category fetch fails.
  }

  try {
    const maxThreads = getSitemapThreadLimit();
    const pageSize = 30;
    let page = 1;
    let collected = 0;

    while (collected < maxThreads) {
      const next = await listThreadsPage({ page, pageSize, sort: "newest" });
      if (next.threads.length === 0) {
        break;
      }

      for (const thread of next.threads) {
        entries.push({
          url: toAbsoluteUrl(`/forum/${encodeURIComponent(thread.id)}`),
          lastModified: new Date(thread.last_activity_at || thread.updated_at || thread.created_at),
          changeFrequency: "daily",
          priority: 0.6,
        });
        collected += 1;
        if (collected >= maxThreads) {
          break;
        }
      }

      if (page * pageSize >= next.total) {
        break;
      }
      page += 1;
    }
  } catch {
    // Keep core URLs even if thread fetch fails.
  }

  return entries;
}
