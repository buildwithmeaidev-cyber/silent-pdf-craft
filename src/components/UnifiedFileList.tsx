import React from "react";
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { useUpload } from "@/context/UploadContext";
import { formatBytes } from "@/lib/pdf";

function Row({ id, name, size, onRemove, onUp, onDown, canUp, canDown }: { id: string; name: string; size: number; onRemove: () => void; onUp: () => void; onDown: () => void; canUp: boolean; canDown: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    touchAction: "none",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-2xl border bg-background p-3 sm:p-4"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        style={{ touchAction: "none" }}
        className="grid place-items-center size-9 rounded-lg text-muted-foreground hover:bg-secondary cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="grid place-items-center size-11 rounded-xl bg-primary/10 text-primary shrink-0">
        <FileText className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
      </div>
      <div className="flex sm:hidden flex-col">
        <button type="button" onClick={onUp} disabled={!canUp} aria-label={`Move ${name} up`}
          className="grid place-items-center size-7 rounded-md text-muted-foreground disabled:opacity-30 hover:bg-secondary">
          <ChevronUp className="size-4" />
        </button>
        <button type="button" onClick={onDown} disabled={!canDown} aria-label={`Move ${name} down`}
          className="grid place-items-center size-7 rounded-md text-muted-foreground disabled:opacity-30 hover:bg-secondary">
          <ChevronDown className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="grid place-items-center size-9 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-accent"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export const UnifiedFileList = () => {
  const { files, removeFile, reorderFiles } = useUpload();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= files.length) return;
    reorderFiles(arrayMove(files, idx, next));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = files.findIndex((f) => f.id === active.id);
    const newIdx = files.findIndex((f) => f.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    reorderFiles(arrayMove(files, oldIdx, newIdx));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {files.map((f, i) => (
            <Row
              key={f.id}
              id={f.id}
              name={f.file.name}
              size={f.file.size}
              onRemove={() => removeFile(f.id)}
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              canUp={i > 0}
              canDown={i < files.length - 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
