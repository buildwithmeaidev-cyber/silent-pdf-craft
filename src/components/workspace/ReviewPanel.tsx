import React from 'react';

export default function ReviewPanel({ tool, files, options, onConfirm, onBack }: {
  tool: string;
  files: File[];
  options?: Record<string, unknown>;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-4 border rounded">
      ReviewPanel placeholder – tool: {tool}
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}
