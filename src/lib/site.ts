/**
 * Single source of truth for the public origin.
 *
 * Every canonical URL, og:url, JSON-LD `url`, and sitemap <loc> is derived from
 * this constant, so the site can never again ship a mix of domains.
 * Override at build time with VITE_SITE_URL (no trailing slash).
 */
const RAW =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://silentpdfai.pages.dev";

export const SITE_URL = String(RAW).replace(/\/$/, "");
export const SITE_NAME = "SilentPDF";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

/** Absolute URL for a route path (`/merge-pdf` -> `https://…/merge-pdf`). */
export const absUrl = (path: string) =>
  `${SITE_URL}${path === "/" ? "/" : `/${path.replace(/^\//, "").replace(/\/$/, "")}`}`;
