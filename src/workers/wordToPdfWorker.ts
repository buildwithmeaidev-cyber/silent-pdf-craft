// src/workers/wordToPdfWorker.ts

/**
 * Placeholder worker for converting a Word document to PDF.
 * Returns a dummy PDF Blob.
 */
self.addEventListener('message', async (event) => {
  const { files, options } = event.data;
  try {
    const total = files.length || 1;
    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      self.postMessage({ type: 'progress', percent, message: `Converting to PDF ${i + 1}/${total}` });
      await new Promise((res) => setTimeout(res, 200));
    }
    const blob = new Blob(['dummy pdf from word'], { type: 'application/pdf' });
    self.postMessage({ type: 'result', payload: { blob, filename: 'converted.pdf' } });
  } catch (e) {
    self.postMessage({ type: 'error', message: (e as Error).message });
  }
});
