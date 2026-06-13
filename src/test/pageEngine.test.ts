// src/test/pageEngine.test.ts
import { describe, it, expect } from 'vitest';
import { loadPdf, getPageCount } from '@/core/page-engine/pageEngine';
import { PDFDocument } from 'pdf-lib';

async function createPdfWithPages(pageCount: number): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    pdfDoc.addPage();
  }
  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes as BlobPart], `test_${pageCount}_pages.pdf`, { type: 'application/pdf' });
  return pdfBytes;
}

describe('PageEngine', () => {
  it('calculates correct page count using PDF.js', async () => {
    const bytes = await createPdfWithPages(5);
    const handle = await loadPdf(bytes);
    const count = await getPageCount(handle);
    expect(count).toBe(5);
  });
});
