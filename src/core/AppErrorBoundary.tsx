import { ErrorBoundary, FallbackProps } from "react-error-boundary";

function ErrorFallback({ error }: FallbackProps) {

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <div className="max-w-lg rounded-3xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-3 text-muted-foreground">
          SilentPDF encountered an unexpected error.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-4 overflow-auto rounded-xl bg-muted p-4 text-left text-xs text-destructive">
            {(error as Error).message}
          </pre>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-primary px-5 py-3 text-ink-foreground transition hover:bg-primary/90"
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}