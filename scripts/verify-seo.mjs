/**
 * Post-build SEO verification.
 *
 * Walks every prerendered HTML file in dist/ and asserts that the per-route
 * Helmet output actually landed in the static markup: unique title/description,
 * self-referencing canonical + og:url, social tags, and the expected JSON-LD.
 * Exits non-zero on any failure so a regression breaks the build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://silentpdfai.pages.dev').replace(/\/$/, '');

const { TOOLS } = await import('../dist-seo-check/tools.mjs').catch(() => ({ TOOLS: null }));

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function routeFor(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/').replace(/\.html$/, '');
  return rel === 'index' ? '/' : `/${rel}`;
}

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : '';
};

const getTitle = (html) => pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
const getMetaName = (html, name) =>
  pick(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
  pick(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'));
const getMetaProp = (html, prop) =>
  pick(html, new RegExp(`<meta[^>]+property=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
  pick(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*property=["']${prop}["']`, 'i'));
const getCanonical = (html) =>
  pick(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
  pick(html, /<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);

function jsonLdTypes(html) {
  const types = new Set();
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    let parsed;
    try {
      parsed = JSON.parse(m[1].trim());
    } catch {
      types.add('__INVALID__');
      continue;
    }
    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      const t = node && node['@type'];
      if (Array.isArray(t)) t.forEach((x) => types.add(x));
      else if (t) types.add(t);
    }
  }
  return types;
}

if (!fs.existsSync(DIST)) {
  console.error('verify-seo: dist/ not found — run the build first.');
  process.exit(1);
}

const toolSlugs = new Set(
  (TOOLS ?? []).map((t) => t.slug)
);

const files = walk(DIST);
const failures = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const rows = [];

for (const file of files) {
  const route = routeFor(file);
  const html = fs.readFileSync(file, 'utf-8');
  const fail = (msg) => failures.push(`${route}: ${msg}`);

  const title = getTitle(html);
  const description = getMetaName(html, 'description');
  const canonical = getCanonical(html);
  const ogUrl = getMetaProp(html, 'og:url');
  const expected = `${SITE_URL}${route === '/' ? '/' : route}`;
  const types = jsonLdTypes(html);

  if (!title) fail('missing <title>');
  if (!description) fail('missing meta description');
  if (title && title.length > 65) fail(`title too long (${title.length} chars)`);
  if (description && description.length > 165) fail(`description too long (${description.length} chars)`);

  if (title) {
    if (seenTitles.has(title)) fail(`duplicate title with ${seenTitles.get(title)}`);
    else seenTitles.set(title, route);
  }
  if (description) {
    if (seenDescriptions.has(description)) fail(`duplicate description with ${seenDescriptions.get(description)}`);
    else seenDescriptions.set(description, route);
  }

  if (canonical !== expected) fail(`canonical "${canonical}" should be "${expected}"`);
  if (ogUrl !== expected) fail(`og:url "${ogUrl}" should be "${expected}"`);
  if (!getMetaProp(html, 'og:title')) fail('missing og:title');
  if (!getMetaProp(html, 'og:description')) fail('missing og:description');
  if (!getMetaName(html, 'twitter:card')) fail('missing twitter:card');

  if (types.has('__INVALID__')) fail('invalid JSON-LD block');
  if (types.size === 0) fail('no JSON-LD structured data');

  const slug = route.slice(1);
  if (route === '/') {
    if (!types.has('Organization')) fail('homepage missing Organization JSON-LD');
    if (!types.has('WebSite')) fail('homepage missing WebSite JSON-LD');
  } else if (toolSlugs.has(slug)) {
    if (!types.has('SoftwareApplication')) fail('tool page missing SoftwareApplication JSON-LD');
  }

  rows.push({ route, title: title.slice(0, 48), jsonLd: [...types].join(',') });
}

rows.sort((a, b) => a.route.localeCompare(b.route));
for (const r of rows) {
  console.log(`${r.route.padEnd(48)} ${r.title.padEnd(50)} ${r.jsonLd}`);
}

console.log(`\nverify-seo: checked ${files.length} pages, ${failures.length} problem(s).`);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log('verify-seo: all checks passed.');
