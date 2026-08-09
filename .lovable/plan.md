# Finish deferred tools, fix links, speed up processing

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

## Technical notes

- Files touched: `src/lib/tools.ts`, `src/lib/workflows.ts`, `src/pages/UseCases.tsx`, `src/pages/tools/ToolPage.tsx`, `src/pages/workflows/WorkflowRunner.tsx`, `src/components/layout/SiteLayout.tsx`, `src/lib/pdf.ts`, plus new `src/workers/pdf.worker.ts`, `src/lib/pdfClient.ts`, `src/components/tools/PageEditor.tsx`, `src/components/tools/ResultPreview.tsx`.
- New dependency: `tesseract.js`. Comlink is already installed.
- Everything stays 100% in-browser; no uploads leave the device.
