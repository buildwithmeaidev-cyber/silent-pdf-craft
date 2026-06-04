import { PDFDocument } from "pdf-lib";

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export interface ValidationResult {
  validFiles: File[];
  errors: string[];
}

export function validatePdfFiles(
  incoming: File[],
  existingFiles: File[] = []
): ValidationResult {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of incoming) {
    // File type validation
    if (file.type !== "application/pdf") {
      errors.push(`${file.name}: Only PDF files are supported`);
      continue;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: File exceeds 25MB limit`);
      continue;
    }

    // Duplicate detection
    const duplicate = existingFiles.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    );

    if (duplicate) {
      errors.push(`${file.name}: File already added`);
      continue;
    }

    validFiles.push(file);
  }

  return {
    validFiles,
    errors,
  };
}

export async function validatePdfIntegrity(
  file: File
): Promise<string | null> {
  try {
    const buffer = await file.arrayBuffer();

    await PDFDocument.load(buffer);

    return null;
  } catch {
    return `${file.name}: Corrupted or unsupported PDF`;
  }
}