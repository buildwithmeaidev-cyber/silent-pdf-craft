// src/workers/rotateWorker.ts

/**
 * Placeholder worker for rotating pages of a PDF.
 * Receives {files, options} where options.rotation specifies degrees.
 */
self.addEventListener('message', async (event) => {
  const { files, options } = event.data;
  try {
    const total = files.length || 1;
    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      self.postMessage({ type: 'progress', percent, message: `Rotating ${i + 1}/${total}` });
      await new Promise((res) => setTimeout(res, 150));
    }
    const blob = new Blob(['rotated pdf content'], { type: 'application/pdf' });
    self.postMessage({ type: 'result', payload: { blob, filename: 'rotated.pdf' } });
  } catch (e) {
    self.postMessage({ type: 'error', message: (e as Error).message });
  }
});
