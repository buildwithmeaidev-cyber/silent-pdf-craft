import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, Check, ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";
import { getPdfJs } from "@/lib/pdf";
import { destroyPdfProxy } from "@/lib/pdfGuards";
import { cn } from "@/lib/utils";

export interface PagePickerProps {
  file: File;
  mode: "select" | "reorder" | "rotate" | "preview";
  value?: number[];
  onChange?: (pages: number[]) => void;
  rotations?: Record<number, number>;
  onRotate?: (page: number, deg: number) => void;
  onMetaChange?: (meta: { numPages: number }) => void;
  onLoadError?: (message: string) => void;
}

const BATCH_SIZE = 8;

export function PagePicker({
  file,
  mode,
  value = [],
  onChange,
  rotations,
  onRotate,
  onMetaChange,
  onLoadError,
}: PagePickerProps) {
  const [numPages, setNumPages] = useState(0);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadError, setLoadError] = useState<string | null>(null);

  const docRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const taskRef = useRef<import("pdfjs-dist").PDFDocumentLoadingTask | null>(null);
  const lastLoadedFileKeyRef = useRef<string | null>(null);
  const thumbsRef = useRef<Record<number, string>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fileKey = `${file.name}:${file.size}:${file.lastModified}`;

  useEffect(() => {
    let cancelled = false;
    setThumbs({});
    thumbsRef.current = {};
    setNumPages(0);
    setVisibleCount(BATCH_SIZE);
    setLoadError(null);

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
        onMetaChange?.({ numPages: doc.numPages });

        const isNewFile = lastLoadedFileKeyRef.current !== fileKey;
        lastLoadedFileKeyRef.current = fileKey;

        if ((mode === "reorder" || mode === "select") && onChange) {
          if (isNewFile || (mode === "reorder" && value.length === 0)) {
            onChange(Array.from({ length: doc.numPages }, (_, i) => i + 1));
          }
        }
      } catch (err) {
        if (cancelled) return;
        const raw = err instanceof Error ? err.message : "";
        const msg = /password/i.test(raw)
          ? `${file.name} is password-protected. Unlock it before loading previews.`
          : `Couldn't render previews for ${file.name}. Check that it is a valid PDF.`;
        setLoadError(msg);
        onLoadError?.(msg);
      }
    })();

    return () => {
      cancelled = true;
      const d = docRef.current;
      const t = taskRef.current;
      docRef.current = null;
      taskRef.current = null;
      void destroyPdfProxy(d, t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileKey]);

  // Re-initialize default order/selection if mode switches cleanly on the same loaded file.
  useEffect(() => {
    if (numPages <= 0 || !onChange) return;
    if (mode === "reorder" && value.length === 0) {
      onChange(Array.from({ length: numPages }, (_, i) => i + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, numPages]);

  // Render thumbnails for pages that became visible and aren't rendered yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const doc = docRef.current;
      if (!doc) return;
      const upto = Math.min(visibleCount, numPages);
      for (let i = 1; i <= upto; i++) {
        if (cancelled) return;
        if (thumbsRef.current[i]) continue;
        try {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;
          const url = canvas.toDataURL("image/jpeg", 0.72);
          canvas.width = 0;
          canvas.height = 0;
          if (!cancelled) {
            thumbsRef.current[i] = url;
            setThumbs((prev) => ({ ...prev, [i]: url }));
          }
        } catch {
          // ignore per-page render failures
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visibleCount, numPages]);

  // Reveal more thumbnails as user scrolls near the bottom.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + BATCH_SIZE, numPages));
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [numPages]);

  const defaultPages = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages],
  );
  const orderedPages = mode === "reorder" ? (value.length > 0 ? value : defaultPages) : defaultPages;
  const kept = useMemo(() => new Set(value), [value]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    if (!onChange) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedPages.indexOf(Number(active.id));
    const newIndex = orderedPages.indexOf(Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(orderedPages, oldIndex, newIndex));
  };

  const movePageBy = (idx: number, delta: -1 | 1) => {
    if (!onChange) return;
    const target = idx + delta;
    if (target < 0 || target >= orderedPages.length) return;
    onChange(arrayMove(orderedPages, idx, target));
  };

  const togglePage = (page: number) => {
    if (!onChange) return;
    if (kept.has(page)) {
      onChange(value.filter((p) => p !== page));
    } else {
      onChange([...value, page].sort((a, b) => a - b));
    }
  };

  if (loadError) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-soft p-3 text-sm text-accent">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <span>{loadError}</span>
      </div>
    );
  }

  if (numPages === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {mode === "select" && onChange && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(defaultPages)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onChange(defaultPages.filter((p) => !kept.has(p)))}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Invert
          </button>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {value.length} of {numPages} selected
          </span>
        </div>
      )}

      {mode === "reorder" && onChange && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Drag cards or use arrow buttons to reorder pages.</p>
          <button
            type="button"
            onClick={() => onChange(defaultPages)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Reset order
          </button>
        </div>
      )}

      {mode === "preview" && (
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Document preview</span>
          <span className="tabular-nums">{numPages} {numPages === 1 ? "page" : "pages"}</span>
        </div>
      )}

      {mode === "reorder" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedPages} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {orderedPages.map((page, index) => (
                <SortableThumb
                  key={page}
                  page={page}
                  index={index}
                  total={orderedPages.length}
                  thumb={thumbs[page]}
                  rotation={rotations?.[page] ?? 0}
                  onRotate={onRotate}
                  onMoveLeft={() => movePageBy(index, -1)}
                  onMoveRight={() => movePageBy(index, 1)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : mode === "rotate" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {defaultPages.map((page) => {
            const deg = ((rotations?.[page] ?? 0) % 360 + 360) % 360;
            return (
              <div key={page} className="relative select-none">
                <button
                  type="button"
                  onClick={() => onRotate?.(page, (deg + 90) % 360)}
                  aria-label={`Rotate page ${page} 90 degrees`}
                  className="relative block w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Thumb thumb={thumbs[page]} page={page} rotation={deg} />
                  {deg !== 0 && (
                    <span className="absolute top-1.5 right-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground tabular-nums">
                      +{deg}°
                    </span>
                  )}
                </button>
                <div className="mt-1 flex items-center justify-between px-0.5">
                  <span className="text-xs text-muted-foreground tabular-nums">Page {page}</span>
                  <button
                    type="button"
                    onClick={() => onRotate?.(page, (deg + 90) % 360)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    aria-label={`Rotate page ${page}`}
                  >
                    <RotateCw className="size-3.5" />
                    <span>+90°</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : mode === "preview" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {defaultPages.map((page) => (
            <div key={page} className="select-none">
              <Thumb thumb={thumbs[page]} page={page} rotation={rotations?.[page] ?? 0} />
              <div className="mt-1 px-0.5 text-xs text-muted-foreground tabular-nums">
                Page {page}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {orderedPages.map((page) => (
            <SelectThumb
              key={page}
              page={page}
              thumb={thumbs[page]}
              kept={kept.has(page)}
              rotation={rotations?.[page] ?? 0}
              onToggle={() => togglePage(page)}
              onRotate={onRotate}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1 w-full" />
    </div>
  );
}

function Thumb({
  thumb,
  page,
  rotation,
  dimmed,
}: {
  thumb?: string;
  page: number;
  rotation: number;
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "aspect-[3/4] rounded-lg border bg-white overflow-hidden grid place-items-center",
        dimmed && "opacity-40",
      )}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={`Page ${page}`}
          className="h-full w-full object-contain transition-transform duration-150"
          style={{ transform: `rotate(${rotation}deg)` }}
          draggable={false}
        />
      ) : (
        <div className="h-full w-full bg-muted animate-pulse" />
      )}
    </div>
  );
}

function SelectThumb({
  page,
  thumb,
  kept,
  rotation,
  onToggle,
  onRotate,
}: {
  page: number;
  thumb?: string;
  kept: boolean;
  rotation: number;
  onToggle: () => void;
  onRotate?: (page: number, deg: number) => void;
}) {
  return (
    <div className="relative select-none">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle page ${page}`}
        aria-pressed={kept}
        className="relative block w-full text-left rounded-lg ring-2 ring-transparent focus:outline-none focus:ring-primary transition-all"
      >
        <Thumb thumb={thumb} page={page} rotation={rotation} dimmed={!kept} />
        {kept ? (
          <span className="absolute top-1.5 right-1.5 grid place-items-center size-5 rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 grid place-items-center size-5 rounded-full bg-muted text-muted-foreground">
            <X className="size-3.5" />
          </span>
        )}
      </button>
      <div className="mt-1 flex items-center justify-between px-0.5">
        <span className={cn("text-xs text-muted-foreground tabular-nums", !kept && "line-through")}>
          Page {page}
        </span>
        {onRotate && (
          <button
            type="button"
            onClick={() => onRotate(page, (rotation + 90) % 360)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Rotate page ${page}`}
          >
            <RotateCw className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SortableThumb({
  page,
  index,
  total,
  thumb,
  rotation,
  onRotate,
  onMoveLeft,
  onMoveRight,
}: {
  page: number;
  index: number;
  total: number;
  thumb?: string;
  rotation: number;
  onRotate?: (page: number, deg: number) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("select-none touch-none", isDragging && "z-10 opacity-80")}
      {...attributes}
      {...listeners}
    >
      <Thumb thumb={thumb} page={page} rotation={rotation} />
      <div className="mt-1 flex items-center justify-between gap-1 px-0.5">
        <span className="text-xs text-muted-foreground tabular-nums">Page {page}</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft();
            }}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label={`Move page ${page} earlier`}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight();
            }}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label={`Move page ${page} later`}
          >
            <ChevronRight className="size-3.5" />
          </button>
          {onRotate && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRotate(page, (rotation + 90) % 360);
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label={`Rotate page ${page}`}
            >
              <RotateCw className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
