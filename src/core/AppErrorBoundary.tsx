import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-slate-600">
          SilentPDF encountered an unexpected error.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-4 overflow-auto rounded-xl bg-slate-100 p-4 text-left text-xs text-red-600">
            {error.message}
          </pre>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

export default function AppErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback as unknown as React.ComponentType<unknown>}
    >
      {children}
    </ErrorBoundary>
  );
}