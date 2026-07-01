// src/workers/ocrWorker.ts
self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  if (type === "init") {
    // Simulate OCR processing and return a dummy result
    self.postMessage({ type: "result", payload: { files: [], options: payload.options, message: "OCR placeholder completed" } });
  }
};
