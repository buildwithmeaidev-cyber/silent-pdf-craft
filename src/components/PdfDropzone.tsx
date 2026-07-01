import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/pdf";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  accept: Record<string, string[]>;
  multiple?: boolean;
  disabled?: boolean;
  /**
   * When false, the component will not render the file list below the dropzone.
   * Useful for tools that provide custom file list UI (e.g., merge tool).
   */
  showFileList?: boolean;
}

export const PdfDropzone = ({ files, onChange, accept, multiple, disabled, showFileList = true }: Props) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept,
    multiple,
    disabled,
    onDrop: (accepted) => {
      onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
    },
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all cursor-pointer bg-card",
          "border-primary/30 hover:border-primary/60 hover:bg-primary-soft/30",
          isDragActive && "border-primary bg-primary-soft/50",
          isDragReject && "border-accent bg-accent-soft",
          disabled && "opacity-60 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto grid place-items-center size-14 rounded-2xl bg-primary-soft text-primary mb-4">
          <UploadCloud className="size-7" strokeWidth={1.8} />
        </div>
        <p className="text-base font-medium text-foreground">
          {isDragActive ? "Drop your file here" : "Drag & drop or click to select"}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {Object.values(accept).flat().join(", ").toUpperCase()} · processed in your browser
        </p>
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
          <span className="size-1.5 rounded-full bg-accent" /> Private
        </span>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5 opacity-70" /> 
        <span>Files are processed entirely in your browser. No files are uploaded to our servers.</span>
      </div>

      {showFileList && files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-soft">
              <span className="grid place-items-center size-9 rounded-lg bg-accent-soft text-accent">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="grid place-items-center size-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label="Remove file"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
