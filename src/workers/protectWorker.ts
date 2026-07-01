// src/workers/protectWorker.ts

/**
 * Placeholder worker for protecting a PDF with a password.
 * Expects options.password to be provided.
 */
self.addEventListener('message', async (event) => {
  const { files, options } = event.data;
  try {
    const total = files.length || 1;
    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      self.postMessage({ type: 'progress', percent, message: `Protecting ${i + 1}/${total}` });
      await new Promise((res) => setTimeout(res, 150));
    }
    // In a real implementation, apply password protection here.
    const blob = new Blob(['protected pdf content'], { type: 'application/pdf' });
    self.postMessage({ type: 'result', payload: { blob, filename: 'protected.pdf' } });
  } catch (e) {
    self.postMessage({ type: 'error', message: (e as Error).message });
  }
});
