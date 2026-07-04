import React from "react";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, FileText } from "lucide-react";
import { useUpload } from "@/context/UploadContext";
import { formatBytes } from "@/lib/pdf";

function Row({ id, name, size, onRemove }: { id: string; name: string; size: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
          {files.map((f) => (
            <Row
              key={f.id}
              id={f.id}
              name={f.file.name}
              size={f.file.size}
              onRemove={() => removeFile(f.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
