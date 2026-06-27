import { useState } from "react";
// PDFDocument import removed; merge logic moved to pdfOperations
import { PROCESS_MESSAGES } from "@/constants/processMessages";
import { processTool } from "@/core/pdf/pdfOperations";

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
      // Revoke any previous URL
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(null);
      setMessage(PROCESS_MESSAGES.validating);
      // Delegate merge to shared PDF operations layer
      const result = await processTool('merge', files);
      setDownloadUrl(result.url);
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

      setMessage(
        `Successfully merged ${files.length} PDF file${
          files.length > 1 ? "s" : ""
        }. Your document is ready to download.`
      );
    } catch (err) {
      console.error(err);
      setError("Unable to process the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const retry = async (files: File[]) => {
    setMessage(PROCESS_MESSAGES.retry);
    await mergePDFs(files);
  };

  // Additional placeholder processing methods for other tools
  const compressPDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('compress', files);
      setDownloadUrl(result.url);
      setMessage(`Compressed ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to compress the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const splitPDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('split', files);
      setDownloadUrl(result.url);
      setMessage(`Split ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to split the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const rotatePDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('rotate', files);
      setDownloadUrl(result.url);
      setMessage(`Rotated ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to rotate the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const protectPDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('protect', files);
      setDownloadUrl(result.url);
      setMessage(`Protected ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to protect the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const unlockPDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('unlock', files);
      setDownloadUrl(result.url);
      setMessage(`Unlocked ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to unlock the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const watermarkPDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('watermark', files);
      setDownloadUrl(result.url);
      setMessage(`Watermarked ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to add watermark to the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  const removeWatermarkPDFs = async (files: File[]) => {
    try {
      setLoading(true);
      setError("");
      setMessage(PROCESS_MESSAGES.processing);
      const result = await processTool('removeWatermark', files);
      setDownloadUrl(result.url);
      setMessage(`Removed watermark from ${files.length} PDF file${files.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error(err);
      setError("Unable to remove watermark from the PDF files. Please try again.");
      setMessage(PROCESS_MESSAGES.error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    message,
    error,
    downloadUrl,
    mergePDFs,
    compressPDFs,
    splitPDFs,
    rotatePDFs,
    protectPDFs,
    unlockPDFs,
    watermarkPDFs,
    removeWatermarkPDFs,
    retry,
    clearState,
    setError,
  };
}