import { useToolFiles } from "@/hooks/useToolFiles";
import { useRealPdfProcess } from "@/hooks/useRealPdfProcess";

import ToolLayout from "@/components/tool-system/ToolLayout";
import ToolUpload from "@/components/tool-system/ToolUpload";
import ToolFileCard from "@/components/tool-system/ToolFileCard";
import ToolActionBar from "@/components/tool-system/ToolActionBar";

import ErrorBanner from "@/core/ErrorBanner";
import ToolSuccess from "@/core/ToolSuccess";
import EmptyState from "@/core/EmptyState";

export default function MergePDF() {
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    uploadErrors,
    clearErrors,
  } = useToolFiles();

  const process = useRealPdfProcess();

  const handleMerge = async () => {
    await process.mergePDFs(files.map((f) => f.file));
  };

  const handleReset = () => {
    clearFiles();
    process.clearState?.();

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document."
    >
      <ToolUpload
        onFiles={(files) => addFiles(files)}
      />

      {uploadErrors.length > 0 && (
        <ErrorBanner
          message={uploadErrors.join(", ")}
          onClose={clearErrors}
        />
      )}

      {process.error && (
        <ErrorBanner
          message={process.error}
          onClose={() => process.setError("")}
          onRetry={() =>
            process.retry?.(files.map((f) => f.file))
          }
        />
      )}

      {files.length === 0 && (
        <EmptyState
          title="No PDFs Uploaded"
          description="Upload two or more PDF files to merge them."
        />
      )}

      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          {files.map((file) => (
            <ToolFileCard
              key={file.id}
              file={file}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </div>
      )}

      {process.loading && (
        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-700">
          {process.message}
        </div>
      )}

      {!process.loading && process.downloadUrl && (
        <ToolSuccess
          title="Merge Complete"
          description={process.message}
          downloadUrl={process.downloadUrl}
        />
      )}

      <ToolActionBar
        disabled={!files.length || process.loading}
        loading={process.loading}
        label="Merge PDFs"
        onClick={handleMerge}
        onReset={handleReset}
        showRetry={Boolean(process.error)}
        onRetry={() =>
          process.retry?.(files.map((f) => f.file))
        }
        downloadUrl={process.downloadUrl || undefined}
        downloadName="merged-document.pdf"
      />
    </ToolLayout>
  );
}