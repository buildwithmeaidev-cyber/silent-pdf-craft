// src/workers/removeWorker.ts

/**
 * Placeholder worker for removing pages from a PDF.
 * Expects options.range to specify pages to keep/remove.
 */
self.addEventListener('message', async (event) => {
  const { files, options } = event.data;
  try {
    const total = files.length || 1;
    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      self.postMessage({ type: 'progress', percent, message: `Removing pages ${i + 1}/${total}` });
      await new Promise((res) => setTimeout(res, 150));
    }
    const blob = new Blob(['removed pages pdf content'], { type: 'application/pdf' });
    self.postMessage({ type: 'result', payload: { blob, filename: 'removed.pdf' } });
  } catch (e) {
    self.postMessage({ type: 'error', message: (e as Error).message });
  }
});
