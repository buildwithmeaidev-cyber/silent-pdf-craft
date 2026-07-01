// src/context/UploadContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

export interface UploadedFile {
  id: string;
  file: File;
}

interface UploadContextProps {
  files: UploadedFile[];
  addFiles: (newFiles: File[]) => void;
  replaceFile: (id: string, newFile: File) => void;
  removeFile: (id: string) => void;
  moveFile: (id: string, direction: "up" | "down") => void;
  clearFiles: () => void;
  error: string | null;
  setError: (msg: string | null) => void;
}

const UploadContext = createContext<UploadContextProps | undefined>(undefined);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => ({ id: uuidv4().replace(/-\d+$/, ''), file: f })),
    ]);
  };

  const replaceFile = (id: string, newFile: File) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, file: newFile } : f))
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (id: string, direction: "up" | "down") => {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const newArr = [...prev];
      const [item] = newArr.splice(idx, 1);
      newArr.splice(newIdx, 0, item);
      return newArr;
    });
  };

  const clearFiles = () => setFiles([]);

  return (
    <UploadContext.Provider
      value={{
        files,
        addFiles,
        replaceFile,
        removeFile,
        moveFile,
        clearFiles,
        error,
        setError,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = (): UploadContextProps => {
  const ctx = useContext(UploadContext);
  if (!ctx) {
    throw new Error("useUpload must be used within UploadProvider");
  }
  return ctx;
};
