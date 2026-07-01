// src/workers/splitWorker.ts

/**
 * Placeholder worker for splitting a PDF into multiple PDFs.
 * Receives {files, options} and returns a dummy PDF Blob.
 */
self.addEventListener('message', async (event) => {
  const { files, options } = event.data;
  try {
    const total = files.length || 1;
    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      self.postMessage({ type: 'progress', percent, message: `Splitting ${i + 1}/${total}` });
      await new Promise((res) => setTimeout(res, 150));
    }
    const blob = new Blob(['split pdf content'], { type: 'application/pdf' });
    self.postMessage({ type: 'result', payload: { blob, filename: 'split.pdf' } });
  } catch (e) {
    self.postMessage({ type: 'error', message: (e as Error).message });
  }
});
