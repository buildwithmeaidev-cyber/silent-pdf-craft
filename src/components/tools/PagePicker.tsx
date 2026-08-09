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
import { Check, RotateCw, X } from "lucide-react";
import { getPdfJs } from "@/lib/pdf";
import { cn } from "@/lib/utils";

export interface PagePickerProps {
  file: File;
  mode: "select" | "reorder";
  value: number[];
  onChange: (pages: number[]) => void;
  rotations?: Record<number, number>;
  onRotate?: (page: number, deg: number) => void;
}

const BATCH_SIZE = 8;

export function PagePicker({ file, mode, value, onChange, rotations, onRotate }: PagePickerProps) {
  const [numPages, setNumPages] = useState(0);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const docRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load the document + page count.
  useEffect(() => {
    let cancelled = false;
    setThumbs({});
    setNumPages(0);
    setVisibleCount(BATCH_SIZE);
    (async () => {
      const pdfjs = await getPdfJs();
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      if (cancelled) return;
      docRef.current = doc;
      setNumPages(doc.numPages);
      if (mode === "reorder" && value.length === 0) {
        onChange(Array.from({ length: doc.numPages }, (_, i) => i + 1));
      } else if (mode === "select" && value.length === 0) {
        onChange(Array.from({ length: doc.numPages }, (_, i) => i + 1));
      }
    })();
    return () => {
      cancelled = true;
      docRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Render thumbnails for pages that became visible and aren't rendered yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const doc = docRef.current;
      if (!doc) return;
      const upto = Math.min(visibleCount, numPages);
      for (let i = 1; i <= upto; i++) {
        if (cancelled) return;
        if (thumbs[i]) continue;
        try {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;
          const url = canvas.toDataURL("image/jpeg", 0.72);
          if (!cancelled) setThumbs((prev) => ({ ...prev, [i]: url }));
        } catch {
          // ignore per-page render failures
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [numPages]);

  const orderedPages = mode === "reorder" ? value : Array.from({ length: numPages }, (_, i) => i + 1);
  const kept = useMemo(() => new Set(value), [value]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedPages.indexOf(Number(active.id));
    const newIndex = orderedPages.indexOf(Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(orderedPages, oldIndex, newIndex));
  };

  const togglePage = (page: number) => {
    if (kept.has(page)) {
      onChange(value.filter((p) => p !== page));
    } else {
      onChange([...value, page].sort((a, b) => a - b));
    }
  };

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
      {mode === "select" && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(Array.from({ length: numPages }, (_, i) => i + 1))}
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
            onClick={() => {
              const all = Array.from({ length: numPages }, (_, i) => i + 1);
              onChange(all.filter((p) => !kept.has(p)));
            }}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Invert
          </button>
        </div>
      )}

      {mode === "reorder" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedPages} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {orderedPages.map((page) => (
                <SortableThumb
                  key={page}
                  page={page}
                  thumb={thumbs[page]}
                  rotation={rotations?.[page] ?? 0}
                  onRotate={onRotate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
    <div className={cn("aspect-[3/4] rounded-lg border bg-card overflow-hidden grid place-items-center", dimmed && "opacity-40")}>
      {thumb ? (
        <img
          src={thumb}
          alt={`Page ${page}`}
          className="h-full w-full object-contain"
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
        className={cn(
          "relative block w-full text-left rounded-lg ring-2 transition-all",
          kept ? "ring-transparent" : "ring-transparent"
        )}
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
        <span className={cn("text-xs text-muted-foreground", !kept && "line-through")}>Page {page}</span>
        {onRotate && (
          <button
            type="button"
            onClick={() => onRotate(page, ((rotation + 90) % 360))}
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
  thumb,
  rotation,
  onRotate,
}: {
  page: number;
  thumb?: string;
  rotation: number;
  onRotate?: (page: number, deg: number) => void;
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
      <div className="mt-1 flex items-center justify-between px-0.5">
        <span className="text-xs text-muted-foreground">Page {page}</span>
        {onRotate && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRotate(page, (rotation + 90) % 360);
            }}
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
