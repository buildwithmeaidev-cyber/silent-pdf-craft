import React from 'react';

export default function UploadStep({ files, setFiles, options, setOptions, tool, onNext, onBack }: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  options?: Record<string, unknown>;
  setOptions?: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  tool?: string;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-4 border rounded">
      UploadStep placeholder – files: {files.length}
      <button onClick={onNext}>Next</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}
