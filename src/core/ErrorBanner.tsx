import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface Props {
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
}

export default function ErrorBanner({
  message,
  onClose,
  onRetry,
}: Props) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <h3 className="font-semibold text-red-900">
              Something went wrong
            </h3>

            <p className="mt-1 text-sm text-red-700">
              {message}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {onRetry && (
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}