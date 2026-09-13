# SilentPDF publishing, SEO pages, tools, and navigation

## Outcome

Prepare the site for the requested `https://silentpdfai.pages.dev` production origin, add the missing search-focused pages, improve the video and template experiences, simplify navigation, and strengthen both document conversion tools before deployment.

## Work

1. **Production URL, SEO, and sitemap**
   - Make the requested `silentpdfai.pages.dev` origin the single source for canonical URLs, Open Graph URLs, structured data, robots, and sitemap entries.
   - Add route metadata and structured data for every new page.
   - Add `/pdf-editor` as a dedicated editor landing/tool page targeting “pdf editor”.
   - Add `/merge-pdf-online` as a focused “merge PDF online” landing page with a direct CTA into the working merge flow and internal links to related tools.
   - Register both routes in the shared route registry so prerendering, sitemap generation, and SEO verification stay synchronized.
   - Run the complete production build and SEO verifier, then inspect representative generated HTML and sitemap URLs.

2. **PDF editor experience**
   - Build a dedicated editor page using the existing browser-based annotation engine, while giving it unique page copy, title, description, FAQ, HowTo data, and editor-specific calls to action.
   - Keep the page visually consistent with the merge and compression tool pages, with clear upload, editing, and download states.

3. **Video tools hub**
   - Expand `/video-tools` from a short listing into a usable hub with the watermark remover plus additional browser-side tools such as trim/cut, video compression, and video-to-GIF where the local engine can support them.
   - Add working tool states, honest format/size limits, progress and error handling, and unique hub/tool metadata.
   - Register all indexable video routes in the sitemap and preserve same-origin bundled processing assets.

4. **Downloadable templates**
   - Keep the existing client-generated PDF approach and turn `/templates` into a clearer category-based template library.
   - Add category filtering and a visible Download action for every template, with loading and disabled states.
   - Ensure generated files remain usable, readable, and genuinely downloadable without signup or server upload.
   - Add any category/detail routes only if they provide real unique content; otherwise keep the main templates page as the indexable destination.

5. **Navbar and site navigation**
   - Rebuild the desktop and mobile navigation around a smaller set of primary destinations, grouping secondary content so the header no longer feels crowded.
   - Keep PDF tools, video tools, workflows, templates, and the main CTA easy to reach.
   - Preserve theme switching, active-route states, keyboard access, and mobile menu behavior.

6. **PDF-to-Word and Word-to-PDF quality**
   - Improve PDF-to-Word extraction for headings, spacing, paragraphs, lists, page breaks, and empty/scanned documents, with clear messaging when editable text is unavailable.
   - Improve Word-to-PDF handling for headings, lists, line breaks, tables/images where the browser conversion libraries expose them, page overflow, and Unicode-safe output.
   - Keep processing local, avoid unsupported claims in the page copy, and make failures actionable instead of showing generic unsupported-tool errors.
   - Validate both conversion paths with representative generated files and the existing tool runner.

## Deployment note

The project currently has no connected custom domain, so the available publish action may create or update the Lovable-hosted URL rather than directly deploying to a Cloudflare `pages.dev` hostname. I will align the production metadata to `silentpdfai.pages.dev`, publish through the available project path, and report any hosting connection required for that exact URL instead of claiming it is live when it is not.

After the site is publicly reachable at the exact target origin, submit its same-origin sitemap to the verified Google Search Console property and request indexing only for the newly added or updated routes. If the property is not verified or the domain is not live, I will stop at the verified prerequisite and report the blocker.

## Technical details

- Reuse the existing route registry, prerenderer, Helmet metadata, PDF engine, FFmpeg bundle, design tokens, and Button component.
- Avoid server-side file processing, third-party runtime media hosting, duplicate metadata, or hardcoded alternate domains.
- Verify light/dark contrast, mobile navigation, tool states, generated output downloads, build status, and SEO output before deployment.
