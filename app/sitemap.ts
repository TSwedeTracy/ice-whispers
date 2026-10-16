import type { MetadataRoute } from "next";
import { RUNES_IN_ORDER, runeSlug, SITE_URL } from "@/lib/seo";

// https://www.icewhispers.com/sitemap.xml — submit it in Google Search Console
// and Bing Webmaster Tools.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/runes`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/our-story`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...RUNES_IN_ORDER.map((r) => ({
      url: `${SITE_URL}/runes/${runeSlug(r)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
