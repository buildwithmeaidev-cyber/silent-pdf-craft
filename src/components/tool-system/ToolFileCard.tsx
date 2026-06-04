import { FileText, GripVertical, Trash2 } from "lucide-react";
import { ToolFile } from "@/hooks/useToolFiles";

interface Props {
  file: ToolFile;
  onRemove: () => void;
}

export default function ToolFileCard({
  file,
  onRemove,
}: Props) {
  const fileSize = (file.file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="group flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl md:flex-row md:items-center md:justify-between">

      {/* Left Side */}
      <div className="flex min-w-0 items-center gap-4">

        {/* Reorder Handle */}
        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* PDF Icon */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>

        {/* File Info */}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900 md:text-lg">
            {file.file.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{fileSize} MB</span>

            <span>•</span>

            <span>Ready to process</span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-12 w-12 items-center justify-center self-end rounded-2xl border border-slate-200 transition-all hover:border-red-200 hover:bg-red-50 md:self-auto"
      >
        <Trash2 className="h-5 w-5 text-slate-500 group-hover:text-red-500" />
      </button>
    </div>
  );
}