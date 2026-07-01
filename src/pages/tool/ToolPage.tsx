import React from 'react';
import { ToolKind } from '@/types/ToolConfig';
import { useParams } from 'react-router-dom';
import toolsConfig from '@/toolsConfig';
import ToolLayout from '@/components/tool-system/ToolLayout';
import ToolUpload from '@/components/tool-system/ToolUpload';
import ToolFileCard from '@/components/tool-system/ToolFileCard';
import ToolActionBar from '@/components/tool-system/ToolActionBar';
import ErrorBanner from '@/core/ErrorBanner';
import ToolSuccess from '@/core/ToolSuccess';
import EmptyState from '@/core/EmptyState';
import useToolFiles from '@/hooks/useToolFiles';
import useRealPdfProcess from '@/hooks/useRealPdfProcess';

export default function ToolPage() {
  const { tool } = useParams<{ tool: string }>();
  const config = toolsConfig[tool as keyof typeof toolsConfig];
  // Retrieve feature flags (fallback to default)
  const featureFlags = (window as any).__FEATURE_FLAGS__ || { enableAdvancedProcessing: false };
  const advancedTools: ToolKind[] = ['ocr', 'imageConvert', 'watermark', 'encrypt', 'pdfToWord', 'wordToPdf'];
  const isAdvancedTool = advancedTools.includes(config.kind as ToolKind);

  if (!config) {
    return <div>Tool not found.</div>;
  }

  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    uploadErrors,
    clearErrors,
  } = useToolFiles();

  const process = useRealPdfProcess();

  const handleAction = async () => {
    if (config.process) {
      // @ts-ignore dynamic method based on config
      await process[config.process](files.map((f) => f.file));
    }
  };

  const handleReset = () => {
    clearFiles();
    // @ts-ignore optional clearState
    process.clearState?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToolLayout title={config.title} description={config.description}>
      <ToolUpload onFiles={addFiles} />
      {uploadErrors.length > 0 && (
        <ErrorBanner message={uploadErrors.join(', ')} onClose={clearErrors} />
      )}
      {process.error && (
        <ErrorBanner
          message={process.error}
          onClose={() => process.setError?.('')}
          onRetry={() => process.retry?.(files.map((f) => f.file))}
        />
      )}
      {files.length === 0 && (
        <EmptyState title='No Files Uploaded' description={config.uploadDescription} />
      )}
      {files.length > 0 && (
        <div className='mt-8 space-y-4'>
          {files.map((file) => (
            <ToolFileCard key={file.id} file={file} onRemove={() => removeFile(file.id)} />
          ))}
        </div>
      )}
      {process.loading && (
        <div className='mt-6 rounded-xl bg-blue-50 p-4 text-blue-700'>{process.message}</div>
      )}
      {!process.loading && (process as any).downloadUrl && (
        <ToolSuccess title='Success' description={process.message} downloadUrl={(process as any).downloadUrl} />
      )}
      <ToolActionBar
        disabled={files.length < (config.minFiles ?? 1) || process.loading || (isAdvancedTool && !featureFlags.enableAdvancedProcessing)}
        loading={process.loading}
        label={config.actionLabel}
        onClick={handleAction}
        onReset={handleReset}
        showRetry={Boolean(process.error)}
        onRetry={() => process.retry?.(files.map((f) => f.file))}
        downloadUrl={(process as any).downloadUrl || undefined}
        downloadName={config.downloadName}
        tooltip={isAdvancedTool && !featureFlags.enableAdvancedProcessing ? 'Advanced processing is disabled via feature flag.' : undefined}
      />
    </ToolLayout>
  );
}
