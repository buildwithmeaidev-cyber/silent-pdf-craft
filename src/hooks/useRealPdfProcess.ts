import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { PROCESS_MESSAGES } from "@/constants/processMessages";

export function useRealPdfProcess() {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearState = () => {
    setError("");
    setMessage("");

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const mergePDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");

      if (!files.length) {
        throw new Error("No PDF files selected.");
      }

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadUrl(null);

      setMessage(PROCESS_MESSAGES.validating);

      const mergedPdf = await PDFDocument.create();

      setMessage(
        `Preparing ${files.length} PDF file${
          files.length > 1 ? "s" : ""
        }...`
      );

      for (const file of files) {
        const bytes = await file.arrayBuffer();

        const pdf = await PDFDocument.load(bytes);

        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      setMessage(PROCESS_MESSAGES.processing);

      const mergedBytes = await mergedPdf.save();

      const blob = new Blob([mergedBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);

      setMessage(
        `Successfully merged ${files.length} PDF file${
          files.length > 1 ? "s" : ""
        }. Your document is ready to download.`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to process the PDF files. Please try again."
      );

      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const retry = async (files: File[]) => {
    setMessage(PROCESS_MESSAGES.retry);
    await mergePDFs(files);
  };

  return {
    loading,
    message,
    error,
    downloadUrl,
    mergePDFs,
    retry,
    clearState,
    setError,
  };
}