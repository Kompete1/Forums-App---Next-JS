import type { MetadataRoute } from "next";
import { toAbsoluteUrl } from "@/lib/seo/site-url";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/moderation/reports", "/notifications", "/profile", "/protected", "/forum/new", "/auth"],
      },
    ],
    sitemap: toAbsoluteUrl("/sitemap.xml"),
  };
}
