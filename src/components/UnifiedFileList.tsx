import React from 'react';
import { ArrowUp, ArrowDown, X, FileText } from 'lucide-react';
import { useUpload } from '@/context/UploadContext';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/pdf';

export const UnifiedFileList = () => {
  const { files, moveFile, removeFile } = useUpload();

  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div
          key={file.id}
          className="flex items-center gap-4 rounded-2xl border bg-background p-4"
        >
          <div className="flex h-16 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <FileText className="size-7" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{file.file.name}</p>
            <p className="text-sm text-muted-foreground">{formatBytes(file.file.size)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveFile(file.id, 'up')}
              disabled={index === 0}
              aria-label={`Move ${file.file.name} up`}
              className="rounded-lg border p-2 hover:bg-secondary disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => moveFile(file.id, 'down')}
              disabled={index === files.length - 1}
              aria-label={`Move ${file.file.name} down`}
              className="rounded-lg border p-2 hover:bg-secondary disabled:opacity-40"
            >
              <ArrowDown className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => removeFile(file.id)}
              aria-label={`Remove ${file.file.name}`}
              className="rounded-lg border p-2 hover:bg-accent/10 text-accent"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
