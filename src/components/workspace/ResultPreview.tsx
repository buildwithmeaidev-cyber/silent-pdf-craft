import React from 'react';

export default function ResultPreview({ result, onNext, onEdit, finalStep }: {
  result: { url: string; filename: string; blob?: Blob } | null;
  onNext: () => void;
  onEdit: () => void;
  finalStep?: boolean;
}) {
  return (
    <div className="p-4 border rounded">
      ResultPreview placeholder – {result?.filename ?? 'no result'}
      <button onClick={onNext}>{finalStep ? 'Finish' : 'Next'}</button>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}
