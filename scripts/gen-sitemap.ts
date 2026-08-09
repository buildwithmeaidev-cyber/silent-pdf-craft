import { TOOLS } from "../src/lib/tools";
import { PROGRAMMATIC } from "../src/lib/programmatic";
import { RESOURCES } from "../src/content/resources/index";
import { PRESET_WORKFLOWS } from "../src/lib/workflows";
const BASE = "https://silentpdfai.pages.dev";
const today = new Date().toISOString().slice(0,10);
const urls: [string, string, string][] = [
  ["/", "weekly", "1.0"], ["/tools", "weekly", "0.9"], ["/workflows", "weekly", "0.8"],
  ["/workflows/custom", "monthly", "0.6"], ["/blog", "weekly", "0.7"], ["/guides", "weekly", "0.7"],
  ["/use-cases", "monthly", "0.6"], ["/resources", "weekly", "0.6"], ["/templates", "monthly", "0.5"],
  ["/about", "yearly", "0.4"], ["/privacy", "yearly", "0.4"], ["/terms", "yearly", "0.3"],
  ["/dpa", "yearly", "0.3"], ["/security", "yearly", "0.4"], ["/contact", "yearly", "0.4"], ["/cookies", "yearly", "0.3"],
];
for (const t of TOOLS) urls.push([`/${t.slug}`, "weekly", "0.9"]);
for (const p of PROGRAMMATIC) urls.push([`/${p.slug}`, "monthly", "0.7"]);
for (const w of PRESET_WORKFLOWS) urls.push([`/workflows/run/${w.id}`, "monthly", "0.5"]);
for (const r of RESOURCES) urls.push([`/resources/${r.category}/${r.slug}`, "monthly", "0.6"]);
const seen = new Set<string>();
const body = urls.filter(([u]) => !seen.has(u) && seen.add(u))
  .map(([loc,cf,pr]) => `  <url><loc>${BASE}${loc}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join("\n");
await Bun.write("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
console.log("urls:", seen.size);
