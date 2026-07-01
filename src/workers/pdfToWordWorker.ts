// src/workers/pdfToWordWorker.ts

/**
 * Placeholder worker for converting a PDF to a Word document.
 * Returns a dummy .docx Blob.
 */
self.addEventListener('message', async (event) => {
  const { files, options } = event.data;
  try {
    const total = files.length || 1;
    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      self.postMessage({ type: 'progress', percent, message: `Converting to Word ${i + 1}/${total}` });
      await new Promise((res) => setTimeout(res, 200));
    }
    const blob = new Blob(['dummy word content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    self.postMessage({ type: 'result', payload: { blob, filename: 'converted.docx' } });
  } catch (e) {
    self.postMessage({ type: 'error', message: (e as Error).message });
  }
});
