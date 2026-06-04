import { useMemo, useState } from "react";
import {
  validatePdfFiles,
  validatePdfIntegrity,
} from "@/lib/pdfValidation";

export interface ToolFile {
  id: string;
  file: File;
  preview?: string;
  status?: "idle" | "uploading" | "processing" | "success" | "error";
}

export function useToolFiles() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const addFiles = async (incoming: File[]) => {
    const {
      validFiles,
      errors,
    } = validatePdfFiles(
      incoming,
      files.map((f) => f.file)
    );

    const cleanFiles: File[] = [];
    const validationErrors = [...errors];

    for (const file of validFiles) {
      const integrityError =
        await validatePdfIntegrity(file);

      if (integrityError) {
        validationErrors.push(integrityError);
        continue;
      }

      cleanFiles.push(file);
    }

    if (validationErrors.length > 0) {
      setUploadErrors(validationErrors);
    }

    const mapped = cleanFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "idle" as const,
    }));

    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) =>
      prev.filter((f) => f.id !== id)
    );
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const clearErrors = () => {
    setUploadErrors([]);
  };

  const totalSize = useMemo(() => {
    return files.reduce(
      (acc, file) => acc + file.file.size,
      0
    );
  }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,

    uploadErrors,
    setUploadErrors,
    clearErrors,

    totalSize,
  };
}