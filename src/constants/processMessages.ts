export const PROCESS_MESSAGES = {
  upload: "Preparing your files...",
  validating: "Validating PDF files...",
  processing: "Processing PDF...",
  success: "Your PDF is ready to download.",
  error: "Something went wrong. Please try again.",
  retry: "Retrying operation...",
  empty: "Upload PDF files to begin.",
} as const;

export type ProcessMessageKey =
  keyof typeof PROCESS_MESSAGES;