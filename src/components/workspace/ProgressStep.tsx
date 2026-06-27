import React from 'react';

export default function ProgressStep({ tool, files, options, setResult, onDone, onBack }: {
  tool: string;
  files: File[];
  options?: Record<string, unknown>;
  setResult: React.Dispatch<React.SetStateAction<{url:string;filename:string;blob?:Blob} | null>>;
  onDone: () => void;
  onBack: () => void;
}) {
  // Simulate processing and then set a dummy result
  const handleProcess = () => {
    setResult({ url: '#', filename: `${tool}-output.pdf` });
    onDone();
  };
  return (
    <div className="p-4 border rounded">
      ProgressStep placeholder – tool: {tool}
      <button onClick={handleProcess}>Process</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}
