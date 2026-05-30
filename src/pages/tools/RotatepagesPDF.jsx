// src/pages/tools/RotatePDF.tsx

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { RotateCw, Upload } from "lucide-react";

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRotate = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const fileBytes = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(fileBytes);

      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;

        page.setRotation(degrees(currentRotation + 90));
      });

      const rotatedPdfBytes = await pdfDoc.save();

      const blob = new Blob([rotatedPdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = `rotated-${file.name}`;

      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Rotate PDF Error:", error);
      alert("Failed to rotate PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <RotateCw className="w-8 h-8 text-cyan-400" />

          <div>
            <h1 className="text-3xl font-bold">
              Rotate PDF
            </h1>

            <p className="text-zinc-400 mt-1">
              Rotate all PDF pages instantly in your browser.
            </p>
          </div>
        </div>

        <label className="border-2 border-dashed border-zinc-700 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition">
          <Upload className="w-12 h-12 text-zinc-500 mb-4" />

          <p className="text-zinc-300 text-center">
            Click to upload your PDF
          </p>

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>

        {file && (
          <div className="mt-6 bg-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-300">
              Selected File:
            </p>

            <p className="font-medium mt-1">
              {file.name}
            </p>
          </div>
        )}

        <button
          onClick={handleRotate}
          disabled={!file || loading}
          className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition"
        >
          {loading ? "Rotating PDF..." : "Rotate PDF"}
        </button>
      </div>
    </div>
  );
}