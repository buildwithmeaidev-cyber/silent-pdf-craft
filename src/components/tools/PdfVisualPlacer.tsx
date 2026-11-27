import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { getPdfJs } from "@/lib/pdf";
import { destroyPdfProxy } from "@/lib/pdfGuards";
import { cn } from "@/lib/utils";

export interface PlacementValue {
  page: number; // 1-indexed
  x: number; // 0..1 relative to page width
  y: number; // 0..1 relative to page height (top-down)
  text?: string;
  imageDataUrl?: string | null;
  rotation?: number;
  size?: number;
}

interface Props {
  file: File;
  mode: "edit" | "esign" | "watermark";
  value: PlacementValue;
  onChange: (val: PlacementValue) => void;
}

export const PdfVisualPlacer: React.FC<Props> = ({ file, mode, value, onChange }) => {
  const [numPages, setNumPages] = useState(1);
  const [pageThumbUrl, setPageThumbUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 841 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const taskRef = useRef<import("pdfjs-dist").PDFDocumentLoadingTask | null>(null);

  const currentPage = Math.min(Math.max(1, value.page || 1), numPages);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    const prevDoc = docRef.current;
    const prevTask = taskRef.current;
    docRef.current = null;
    taskRef.current = null;
    if (prevDoc || prevTask) {
      void destroyPdfProxy(prevDoc, prevTask);
    }

    (async () => {
      try {
        const pdfjs = await getPdfJs();
        const buf = new Uint8Array(await file.arrayBuffer());
        if (cancelled) return;
        const task = pdfjs.getDocument({ data: buf });
        taskRef.current = task;
        const doc = await task.promise;
        if (cancelled) {
          await destroyPdfProxy(doc, task);
          return;
        }
        docRef.current = doc;
        setNumPages(doc.numPages);
        if (value.page > doc.numPages) {
          onChange({ ...value, page: doc.numPages });
        }
      } catch (err) {
        console.error("[PdfVisualPlacer] Failed to load PDF:", err);
      }
    })();

    return () => {
      cancelled = true;
      void destroyPdfProxy(docRef.current, taskRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Render current page canvas
  const renderPage = useCallback(async () => {
    const doc = docRef.current;
    if (!doc) return;
    try {
      const page = await doc.getPage(currentPage);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      setPageSize({ width: unscaledViewport.width, height: unscaledViewport.height });

      const scale = 1.25 * zoom;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;
      const url = canvas.toDataURL("image/jpeg", 0.85);
      setPageThumbUrl(url);
      canvas.width = 0;
      canvas.height = 0;
    } catch (err) {
      console.error("[PdfVisualPlacer] Render page failed:", err);
    }
  }, [currentPage, zoom]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = Math.max(0, Math.min(1, clickX / rect.width));
    const y = Math.max(0, Math.min(1, clickY / rect.height));

    onChange({ ...value, x, y, page: currentPage });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    const x = Math.max(0, Math.min(1, moveX / rect.width));
    const y = Math.max(0, Math.min(1, moveY / rect.height));

    onChange({ ...value, x, y, page: currentPage });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/40 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onChange({ ...value, page: currentPage - 1 })}
            className="rounded-lg border bg-card p-1.5 hover:bg-secondary disabled:opacity-30 transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-medium tabular-nums">
            Page {currentPage} of {numPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => onChange({ ...value, page: currentPage + 1 })}
            className="rounded-lg border bg-card p-1.5 hover:bg-secondary disabled:opacity-30 transition"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            className="rounded-lg border bg-card p-1.5 hover:bg-secondary transition"
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.25))}
            className="rounded-lg border bg-card p-1.5 hover:bg-secondary transition"
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border bg-card/50 p-4 grid place-items-center min-h-[420px]">
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerMove={handlePointerMove}
          className="relative shadow-lg rounded-lg overflow-hidden cursor-crosshair bg-white select-none max-w-full"
          style={{
            aspectRatio: `${pageSize.width} / ${pageSize.height}`,
            width: `${Math.round(pageSize.width * 0.75 * zoom)}px`,
          }}
        >
          {pageThumbUrl ? (
            <img src={pageThumbUrl} alt={`Page ${currentPage}`} className="w-full h-full block pointer-events-none" />
          ) : (
            <div className="w-full h-full bg-muted animate-pulse grid place-items-center text-xs text-muted-foreground">
              Rendering preview…
            </div>
          )}

          {/* Placement marker */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
            style={{ left: `${(value.x ?? 0.5) * 100}%`, top: `${(value.y ?? 0.5) * 100}%` }}
          >
            {mode === "esign" && value.imageDataUrl ? (
              <div className="border-2 border-primary/80 bg-primary/10 rounded px-2 py-1 shadow-md">
                <img src={value.imageDataUrl} alt="Signature" className="h-12 object-contain max-w-[160px]" />
              </div>
            ) : mode === "watermark" ? (
              <div className="text-destructive/80 font-bold uppercase tracking-widest text-lg px-3 py-1 bg-white/80 rounded border border-destructive/30 whitespace-nowrap shadow">
                {value.text || "WATERMARK"}
              </div>
            ) : (
              <div className="bg-primary text-primary-foreground font-medium text-xs px-2.5 py-1 rounded shadow-md border border-primary-foreground/30 whitespace-nowrap">
                {value.text || "New Text"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Click anywhere on the page above to reposition your placement.</span>
        <span className="tabular-nums">
          X: {Math.round((value.x ?? 0) * 100)}% · Y: {Math.round((value.y ?? 0) * 100)}%
        </span>
      </div>
    </div>
  );
};
