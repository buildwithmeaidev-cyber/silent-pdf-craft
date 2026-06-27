import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Page item model – represents a single page in the PDF.
 */
export interface PageItem {
  /** 1‑based page number */
  pageNumber: number;
  /** Optional thumbnail data‑URL to display */
  thumbnail?: string;
}

/** Props for the PageReorder component */
export interface PageReorderProps {
  /** Array of pages to display */
  items: PageItem[];
  /** Callback invoked when the order changes */
  onChange: (newItems: PageItem[]) => void;
  /** Optional label for the component */
  label?: string;
}

/** Internal sortable element used by the component */
function SortablePage({ id, thumbnail }: { id: string; thumbnail?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    backgroundColor: isDragging ? "#f0f0f0" : "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "4px",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span style={{ marginRight: "8px", userSelect: "none" }}>{id}</span>
      {thumbnail && (
        <img
          src={thumbnail}
          alt={`Page ${id}`}
          style={{ height: "40px", objectFit: "contain" }}
        />
      )}
    </div>
  );
}

/**
 * Shared drag‑and‑drop page reordering component.
 *
 * Usage example:
 * ```tsx
 * const [pages, setPages] = useState<PageItem[]>(initialPages);
 * <PageReorder items={pages} onChange={setPages} />
 * ```
 */
export default function PageReorder({ items, onChange, label }: PageReorderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.pageNumber.toString() === active.id);
      const newIndex = items.findIndex((i) => i.pageNumber.toString() === over?.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      // Re‑assign page numbers to keep them sequential (optional but convenient)
      const final = reordered.map((item, idx) => ({
        ...item,
        pageNumber: idx + 1,
      }));
      onChange(final);
    }
    setActiveId(null);
  };

  return (
    <div>
      {label && <h3>{label}</h3>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.pageNumber.toString())} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortablePage key={item.pageNumber} id={item.pageNumber.toString()} thumbnail={item.thumbnail} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
