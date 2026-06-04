import {
  Download,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface Props {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onClick?: () => void;
  onReset?: () => void;
  onRetry?: () => void;
  downloadUrl?: string;
  downloadName?: string;
  showRetry?: boolean;
}

export default function ToolActionBar({
  disabled,
  loading,
  label = "Process PDF",
  onClick,
  onReset,
  onRetry,
  downloadUrl,
  downloadName = "silentpdf-output.pdf",
  showRetry = false,
}: Props) {
  const isCompleted = Boolean(downloadUrl);

  return (
    <div className="sticky bottom-4 z-50 mt-8">
      <div className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
              )}

              <h3 className="text-lg font-bold text-slate-900">
                {isCompleted
                  ? "PDF ready for download"
                  : loading
                  ? "Processing PDF"
                  : "Files ready for processing"}
              </h3>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {isCompleted
                ? "Your PDF has been successfully generated."
                : loading
                ? "Please wait while your files are being processed."
                : "Your files stay private and process securely in your browser."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-8 text-base font-semibold text-red-700 transition-all hover:bg-red-100"
              >
                <RefreshCw className="h-5 w-5" />
                Retry
              </button>
            )}

            {isCompleted && (
              <a
                href={downloadUrl ?? "#"}
                download={downloadName}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </a>
            )}

            <button
              disabled={disabled}
              onClick={isCompleted ? onReset : onClick}
              className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 text-base font-semibold text-slate-900 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-5 w-5" />
                  Merge More Files
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {label}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}