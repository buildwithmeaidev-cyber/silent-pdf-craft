import { useState } from "react";

import {
  UploadCloud,
  Lock,
} from "lucide-react";

interface Props {
  onFiles: (files: File[]) => void;
}

export default function ToolUpload({ onFiles }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    onFiles(Array.from(files));
  };

  return (
    <div className="rounded-[36px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex min-h-[340px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[30px] border-2 border-dashed px-6 text-center transition-all duration-300 md:min-h-[420px] ${
          dragging
            ? "scale-[1.01] border-blue-500 bg-blue-50"
            : "border-blue-200 bg-slate-50"
        }`}
      >
        {/* Private Badge */}
        <div className="absolute right-5 top-5 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
                 Browser-Based
          </div>
        </div>

        {/* Upload Icon */}
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-100 shadow-inner">
          <UploadCloud className="h-12 w-12 text-blue-600" />
        </div>

        {/* Heading */}
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Select PDF Files
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
          Drag and drop your PDF files here or click below to upload
          them securely from your device.
        </p>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-blue-700">
          Choose PDF Files
        </div>

        {/* Trust Section */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
             <Lock className="h-4 w-4" />
            <span>Files never leave your device</span>
        </div>

        <input
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
}