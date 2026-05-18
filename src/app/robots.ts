import type { MetadataRoute } from "next";

import { DEFAULT_SITE_ORIGIN } from "@/lib/appPaths";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_ORIGIN;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/ingest", "/api/admin"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
