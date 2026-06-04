import ToolLayout from "@/components/tool-system/ToolLayout";
import ToolUpload from "@/components/tool-system/ToolUpload";
import ToolFileCard from "@/components/tool-system/ToolFileCard";
import ToolActionBar from "@/components/tool-system/ToolActionBar";

import ErrorBanner from "@/core/ErrorBanner";
import ToolSuccess from "@/core/ToolSuccess";
import EmptyState from "@/core/EmptyState";

import { useToolFiles } from "@/hooks/useToolFiles";
import { useRealPdfProcess } from "@/hooks/useRealPdfProcess";

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
    await process.mergePDFs(
      files.map((f) => f.file)
    );
  };

  const handleReset = () => {
    clearFiles();

    if (process.clearState) {
      process.clearState();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document."
    >
      {/* Upload */}
      <ToolUpload
        onFiles={(files) => {
          void addFiles(files);
        }}
      />

      {/* Upload Validation Errors */}
      {uploadErrors.length > 0 && (
        <div className="mt-6">
          <ErrorBanner
            message={uploadErrors.join(", ")}
            onClose={clearErrors}
          />
        </div>
      )}

      {/* Process Errors */}
      {process.error && (
        <div className="mt-6">
          <ErrorBanner
            message={process.error}
            onClose={() => process.setError("")}
            onRetry={() =>
              process.retry?.(
                files.map((f) => f.file)
              )
            }
          />
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No PDFs Uploaded"
            description="Upload two or more PDF files to merge them into a single document."
          />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                Uploaded Files
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Arrange files in the order you want them merged.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              {files.length} file{files.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="space-y-4">
            {files.map((file) => (
              <ToolFileCard
                key={file.id}
                file={file}
                onRemove={() =>
                  removeFile(file.id)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing */}
      {process.loading && (
        <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-900">
            Processing PDF Files
          </h3>

          <p className="mt-2 text-sm text-blue-700">
            {process.message}
          </p>
        </div>
      )}

      {/* Success */}
      {!process.loading &&
        process.downloadUrl && (
          <div className="mt-6">
            <ToolSuccess
              title="Merge Complete"
              description={process.message}
              downloadUrl={process.downloadUrl}
            />
          </div>
        )}

      {/* Action Bar */}
      <ToolActionBar
        disabled={
          !files.length || process.loading
        }
        loading={process.loading}
        label="Merge PDFs"
        onClick={handleMerge}
        onReset={handleReset}
        showRetry={Boolean(process.error)}
        onRetry={() =>
          process.retry?.(
            files.map((f) => f.file)
          )
        }
        downloadUrl={
          process.downloadUrl || undefined
        }
        downloadName="merged-document.pdf"
      />
    </ToolLayout>
  );
}