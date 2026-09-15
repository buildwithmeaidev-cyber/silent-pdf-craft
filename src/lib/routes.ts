/**
 * Single source of truth for every indexable route.
 *
 * The prerenderer and the sitemap generator both read this list, so a new tool,
 * blog post, or landing page automatically gets a prerendered HTML file *and* a
 * sitemap entry — they can never drift apart again.
 */
import { TOOLS } from "@/lib/tools";
import { PROGRAMMATIC } from "@/lib/programmatic";
import { POSTS } from "@/content/blog/posts";
import { RESOURCES } from "@/content/resources";
import { PRESET_WORKFLOWS } from "@/lib/workflows";

export type RouteEntry = {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: string;
};

function build(): RouteEntry[] {
  const entries: RouteEntry[] = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/tools", changefreq: "daily", priority: "0.9" },
    { path: "/video-tools", changefreq: "weekly", priority: "0.9" },
    { path: "/workflows", changefreq: "weekly", priority: "0.8" },
    { path: "/workflows/custom", changefreq: "monthly", priority: "0.6" },
    { path: "/templates", changefreq: "weekly", priority: "0.8" },
    { path: "/templates/career", changefreq: "monthly", priority: "0.6" },
    { path: "/templates/business", changefreq: "monthly", priority: "0.6" },
    { path: "/templates/legal", changefreq: "monthly", priority: "0.6" },
    { path: "/pdf-editor", changefreq: "weekly", priority: "0.9" },
    { path: "/merge-pdf-online", changefreq: "weekly", priority: "0.9" },
    { path: "/blog", changefreq: "weekly", priority: "0.7" },
    { path: "/guides", changefreq: "weekly", priority: "0.7" },
    { path: "/use-cases", changefreq: "monthly", priority: "0.6" },
    { path: "/resources", changefreq: "weekly", priority: "0.6" },
    { path: "/about", changefreq: "yearly", priority: "0.4" },
    { path: "/privacy", changefreq: "yearly", priority: "0.4" },
    { path: "/security", changefreq: "yearly", priority: "0.4" },
    { path: "/contact", changefreq: "yearly", priority: "0.4" },
    { path: "/terms", changefreq: "yearly", priority: "0.3" },
    { path: "/dpa", changefreq: "yearly", priority: "0.3" },
    { path: "/cookies", changefreq: "yearly", priority: "0.3" },
  ];

  // Every PDF tool gets its own indexable page.
  for (const t of TOOLS) entries.push({ path: `/${t.slug}`, changefreq: "weekly", priority: "0.9" });

  // Video tools (standalone pages, not part of the PDF TOOLS registry).
  entries.push({ path: "/remove-video-watermark", changefreq: "weekly", priority: "0.9" });

  for (const p of PROGRAMMATIC) entries.push({ path: `/${p.slug}`, changefreq: "monthly", priority: "0.7" });
  for (const p of POSTS) entries.push({ path: `/blog/${p.slug}`, changefreq: "monthly", priority: "0.7" });
  for (const w of PRESET_WORKFLOWS) entries.push({ path: `/workflows/run/${w.id}`, changefreq: "monthly", priority: "0.5" });

  const categories = Array.from(new Set(RESOURCES.map((r) => r.category)));
  for (const c of categories) entries.push({ path: `/resources/${c}`, changefreq: "weekly", priority: "0.6" });
  for (const r of RESOURCES)
    entries.push({ path: `/resources/${r.category}/${r.slug}`, changefreq: "monthly", priority: "0.6" });

  const seen = new Set<string>();
  return entries.filter((e) => !seen.has(e.path) && seen.add(e.path));
}

export const ROUTES: RouteEntry[] = build();
export const ROUTE_PATHS: string[] = ROUTES.map((r) => r.path);
