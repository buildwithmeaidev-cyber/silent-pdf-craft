// src/context/ErrorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import ErrorModal from "@/components/ErrorModal";

export type ErrorKind =
  | "UnsupportedFile"
  | "PasswordProtected"
  | "Corrupted"
  | "MemoryLimit"
  | "Cancelled"
  | "WorkerFailure"
  | "LibraryError"
  | "Unknown";

export interface ErrorInfo {
  title: string;
  message: string;
  kind?: ErrorKind;
  // Optional retry callback
  onRetry?: () => void;
}

interface ErrorContextProps {
  error: ErrorInfo | null;
  showError: (info: ErrorInfo) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextProps | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const showError = (info: ErrorInfo) => setError(info);
  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      {error && (
        <ErrorModal
          title={error.title}
          message={error.message}
          onClose={clearError}
          onRetry={error.onRetry}
        />
      )}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextProps => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error("useError must be used within ErrorProvider");
  }
  return ctx;
};
