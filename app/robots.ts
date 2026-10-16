import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Search engines AND AI assistants (ChatGPT, Claude, Perplexity, Gemini…)
// are welcome to read the public pages. Private pages and the API are not.
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/account", "/journal", "/reset-password"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"].map(
        (userAgent) => ({ userAgent, allow: "/", disallow })
      ),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
