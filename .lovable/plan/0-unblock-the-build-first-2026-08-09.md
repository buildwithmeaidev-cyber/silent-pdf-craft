- Finish deferred tools, fix links, speed up processing

## 0. Unblock the build first

The typecheck currently fails with 18 errors that are unrelated to this request but block shipping anything:

- Content cluster files declare `relatedToolSlugs` / `relatedAssetSlugs` as fixed-length tuples (`[string, string, string]`, `[string, string]`) but supply fewer entries. Fix: relax those fields to `string[]` in the shared `ContentAsset` type.
- `compress/compress-pdf-below-1mb-cluster.ts` and `templates/templates-cluster.ts` import from the wrong relative path. Fix: point both at `src/content/ContentAsset`.
- `src/lib/seo.ts` builds a JSON-LD object then assigns `step` / `mainEntity` onto its inferred literal type. Fix: type the builder's return as a record.

## 1. Broken tool links (verified)

- `src/lib/tools.ts` registers the remove-watermark tool with the slug `Removewatermark-pdf` (capital R), while every link in the app points to `removewatermark-pdf` (workflows registry, programmatic pages, blog posts). Those links currently land on Not Found. Fix: rename the slug to lowercase.
- The workflow registry maps the `sign` step to the slug `sign-pdf`, but no tool with that slug exists (the real one is `esign-pdf`). Use Cases also links `sign-pdf`. Fix: point `sign` at `esign-pdf` and correct the persona links.
- Sweep every `relatedToolSlugs` / `relatedSlugs` / persona link against the tool registry and fix any other dead slug, so each workflow and persona card opens a real tool.
- Add a small dev-time guard that logs any link slug missing from the registry, so this cannot regress silently.

## 2. Cross-tool upload state

Files are cleared today only when the tool slug changes. Leaving a tool for a workflow, resource, or home page keeps the file in context, so returning shows a stale selection. Fix: clear upload context on every route change (single effect at the layout level) and after a successful download, so each tool always starts empty.

## 3. Comlink worker offload

Move the heavy work in `src/lib/pdf.ts` (merge, compress, image-to-pdf, watermark, remove-watermark, conversions) into a dedicated worker exposed through Comlink (already a dependency).

- New worker module re-exporting the pdf operations; files transferred as ArrayBuffers, results returned as bytes.
- A thin client wrapper keeps the current function signatures so `ToolPage` and `WorkflowRunner` need no rewrite.
- Progress reported back per page so the progress bar is real instead of stepped.
- Flip `workerOffload` in `featureFlags.ts` on once verified, with a main-thread fallback if the worker fails to start.

## 4. Drag-to-place PDF editor

Build a page-thumbnail canvas editor used by Edit, E-Sign, and Watermark:

- Left rail of rendered page thumbnails; drag to reorder pages.
- Main canvas renders the selected page; drag text, signature image, or watermark onto it, move and resize with handles, with page/coordinate mapping to pdf-lib points on export.
- Element list per page with delete; export applies all placements in one pass.
- Ships behind `pdfEditorV2`, enabled once the three tools render correctly.

The PDF Blender project link cannot be read from here, so the editor will follow the interaction model described above using the existing design tokens rather than copying that code. If you want its exact implementation, share the file contents or the project name in this workspace.

## 5. OCR PDF tool

- Add `tesseract.js`, a new `ocr-pdf` tool entry, an `ocr` kind in the workflow registry, and an OCR route.
- Render each page via pdf.js, run recognition, and write an invisible text layer over the original page so the downloaded PDF stays visually identical but is searchable and selectable.
- Language selector (English default), per-page progress, and a clear warning that OCR is slower than other tools.

## 6. Error handling and UI polish

- Every tool path returns a specific message instead of the generic "Unsupported tool": wrong file type, encrypted/corrupt PDF, over the 50 MB cap, empty result.
- Consistent tool page layout: upload → configure → run → preview → download, with a result preview (first-page thumbnail plus page count and size delta) on every tool, not just some.
- Disabled run buttons explain what is missing; errors render in one shared banner style.
- Reduce layout shift while processing and keep the progress bar responsive now that work is off the main thread.

7. fix all the bug and improve the ui and dark mode working in some and not working in some and make sure that the all pages are inter linked and acessible and fix the sitemap as not able to submit in the google search counsle and rename the website to silentpdf only from silentpdf ai and make sure that everywere the site mame is writen to silentpdf and i want an seo strong to get real user so i want you to make it an strong seo for it that can get to search of merge pdf and like this for all the 16 tools that it get on the search result when user search merge pdf free and other every thing to be for all 16 tools merge,split,compress,pdf to word word to pdf ,rotate pdf rempve pages protect pages edit pdf e sign pdf watermark pdf phato to pdf reorder pdf add pages remove watermark make sure that all these pdf tools has an strong search result in the google for seo and aeo 

8. improve the tools quality 
  1. merge pdf not able to reorder pdf files in the mobile fix it .
  2. in split pdf not able to split as i want cant understand how it split so give some feature like i love pdf which has preview of all pages and can delete or can keep as we want. 
  3. compress pdf improve the custom compress and give no input in it and fix the ui for it in mobile the fornt are inter merge.
  4. pdf to word fix the spacing all the spacing are gone and not is good make the pdf as it is in the word form in it 
  5. word to pdf when convert the spacing is gone and no spacing and all the word are inter merge so fix it and the word all spacing and text is same in the pdf 
  6. in rotate pdf improve the mobile spacing in it 
  7. in delete pages the give the preview of each page and option to rotate and delete or make one in the like edit pdf which can rotate and delete pages and other pdf file
  8. protect pdf is not working fix it as the it is fake processing and give the same file with edited name
  9. give preview in the edit pdf all the feature in it with option to edit in the preview 
  10. improve the e sign pdf as and add preview as cant resize and replace the sign where we want 
  11. watermark its not working as the pdf the watermark is too big give the customisation of it
  12. reorder pages not working as the preview is not supported by defalt the preview of all pages should be 
  13. removewatermark  is not working and there is the text of CONFIDENTIAL, DRAFT, COPY, SAMPLE, SPECIMEN, WATERMARK remove all these option and just remove watermark option and it should remove all the watermark type and it shoud be real and watermark should be removed 
  14. in all the tools there is an partially dark make it full as it is not good 
  &nbsp;
9. add new tools of pdf and one is removewatermark from video make sure that it is working in real as peole are asking for it and i think its good to make it so add this and real processing and it should be capable of removing the watermark from video 

## Technical notes

- Files touched: `src/lib/tools.ts`, `src/lib/workflows.ts`, `src/pages/UseCases.tsx`, `src/pages/tools/ToolPage.tsx`, `src/pages/workflows/WorkflowRunner.tsx`, `src/components/layout/SiteLayout.tsx`, `src/lib/pdf.ts`, plus new `src/workers/pdf.worker.ts`, `src/lib/pdfClient.ts`, `src/components/tools/PageEditor.tsx`, `src/components/tools/ResultPreview.tsx`.
- New dependency: `tesseract.js`. Comlink is already installed.
- Everything stays 100% in-browser; no uploads leave the device.