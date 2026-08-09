import { useCallback, useEffect, useRef, useState } from "react";
import { getPdfJs } from "@/lib/pdf";

export interface Placement {
  x: number; // 0..1 center
  y: number; // 0..1 center (from top)
  scale: number; // 0..1 of page width
  rotation?: number;
  page: number; // 1-indexed
}

interface Props {
  file: File;
  /** PNG/JPEG data URL to place, or plain text to place. */
  imageDataUrl?: string | null;
  text?: string;
  color?: string;
  opacity?: number;
  value: Placement;
  onChange: (p: Placement) => void;
  label?: string;
}

/**
 * Renders the chosen PDF page and lets the user drag the signature/watermark
 * onto the exact spot, with a size slider. Coordinates are normalised (0..1)
 * so they map straight onto pdf-lib page units on export.
 */
export const OverlayPlacer = ({
  file,
  imageDataUrl,
  text,
  color = "#b31a1a",
  opacity = 0.35,
  value,
  onChange,
  label = "Drag to position",
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [rendering, setRendering] = useState(true);
  const [dragging, setDragging] = useState(false);

  const renderPage = useCallback(async () => {
    setRendering(true);
    try {
      const pdfjs = await getPdfJs();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      setPageCount(doc.numPages);
      const pageNo = Math.min(Math.max(1, value.page), doc.numPages);
      const page = await doc.getPage(pageNo);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const targetWidth = wrapRef.current?.clientWidth ?? 640;
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(2, targetWidth / base.width) });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
      (doc as unknown as { destroy?: () => void }).destroy?.();
    } finally {
      setRendering(false);
    }
  }, [file, value.page]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  const moveTo = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange({ ...value, x, y });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Page</span>
            <input
              type="number"
              min={1}
              max={pageCount}
              value={value.page}
              onChange={(e) =>
                onChange({ ...value, page: Math.min(pageCount, Math.max(1, Number(e.target.value) || 1)) })
              }
              className="w-20 rounded-lg border bg-background px-2 py-1"
            />
            <span className="text-muted-foreground">of {pageCount}</span>
          </div>
        )}
      </div>

      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl border bg-muted"
        onPointerDown={(e) => {
          setDragging(true);
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          moveTo(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && moveTo(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        style={{ touchAction: "none" }}
      >
        <canvas ref={canvasRef} className="block w-full h-auto" />
        {rendering && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Rendering page…
          </div>
        )}

        {/* the draggable overlay */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            left: `${value.x * 100}%`,
            top: `${value.y * 100}%`,
            width: `${value.scale * 100}%`,
            opacity,
            transform: `translate(-50%, -50%) rotate(${value.rotation ?? 0}deg)`,
          }}
        >
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="" className="w-full h-auto" />
          ) : (
            <span
              className="block whitespace-nowrap text-center font-bold leading-none"
              style={{ color, fontSize: `calc(${value.scale} * 14vw)` }}
            >
              {text || "TEXT"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground w-16">Size</label>
        <input
          type="range"
          min={5}
          max={100}
          value={Math.round(value.scale * 100)}
          onChange={(e) => onChange({ ...value, scale: Number(e.target.value) / 100 })}
          className="flex-1 accent-[hsl(var(--primary))]"
        />
        <span className="w-12 text-right text-sm tabular-nums">{Math.round(value.scale * 100)}%</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground w-16">Rotate</label>
        <input
          type="range"
          min={-90}
          max={90}
          value={value.rotation ?? 0}
          onChange={(e) => onChange({ ...value, rotation: Number(e.target.value) })}
          className="flex-1 accent-[hsl(var(--primary))]"
        />
        <span className="w-12 text-right text-sm tabular-nums">{value.rotation ?? 0}°</span>
      </div>
    </div>
  );
};

export default OverlayPlacer;
