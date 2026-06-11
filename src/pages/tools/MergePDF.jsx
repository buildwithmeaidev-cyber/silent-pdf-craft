import { useToolFiles } from "@/hooks/useToolFiles";
import { useToolProcessor } from "@/core/engine/useToolProcessor";
import ToolLayout from "@/components/tool-system/ToolLayout";
import ToolUpload from "@/components/tool-system/ToolUpload";
import ToolFileCard from "@/components/tool-system/ToolFileCard";
import ToolActionBar from "@/components/tool-system/ToolActionBar";
import ErrorBanner from "@/core/ErrorBanner";
import EmptyState from "@/core/EmptyState";
import ToolSuccess from "@/core/ToolSuccess";

export default function MergePDF() {
  const { files, addFiles, removeFile, clearFiles, uploadErrors, clearErrors } = useToolFiles();
  const { mergePDFs, loading, message, error, downloadUrl, clearState, setError, retry } = useToolProcessor();

  const handleMerge = async () => {
    await mergePDFs(files.map((f) => f.file));
  };

  const handleReset = () => {
    clearFiles();
    clearState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ToolLayout title="Merge PDF" description="Combine multiple PDF files into one document.">
      <ToolUpload onFiles={addFiles} />

      {uploadErrors.length > 0 && (
        <ErrorBanner message={uploadErrors.join(", ")} onClose={clearErrors} />
      )}

      {error && (
        <ErrorBanner message={error} onClose={() => setError("")} onRetry={() => retry(files.map((f) => f.file))} />
      )}

      {files.length === 0 && (
        <EmptyState title="No PDFs Uploaded" description="Upload two or more PDF files to merge them." />
      )}

      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          {files.map((file) => (
            <ToolFileCard key={file.id} file={file} onRemove={() => removeFile(file.id)} />
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-700">{message}</div>
      )}

      {downloadUrl && (
        <ToolActionBar
          disabled={false}
          loading={false}
          label="Merge PDFs"
          onClick={handleMerge}
          onReset={handleReset}
          downloadUrl={downloadUrl}
          downloadName="merged-document.pdf"
          showRetry={false}
        />
      )}

      {downloadUrl && !loading && (
        <ToolSuccess title="Merge Complete" description={message} downloadUrl={downloadUrl} />
      )}
    </ToolLayout>
  );
}