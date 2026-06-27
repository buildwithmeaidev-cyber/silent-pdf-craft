// src/scripts/mergeTest.ts

/**
 * Simple test script to create two PDF files in memory and merge them using the universal PDF engine.
 * It uses pdf-lib to generate minimal PDFs, then calls the engine's merge function.
 * The result is saved to the project root as `merged_test.pdf`.
 */
import { PDFDocument } from 'pdf-lib';
import { pdfEngine } from '../core/engine/pdfEngine.ts';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function createPdf(text: string): Promise<File> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([200, 200]);
  const helvetica = await doc.embedFont(PDFDocument.StandardFonts.Helvetica);
  page.drawText(text, { x: 20, y: 100, size: 24, font: helvetica });
  const bytes = await doc.save();
  // Create a minimal File-like object compatible with pdfEngine.
  const file = {
    name: `test_${text}.pdf`,
    size: bytes.length,
    type: 'application/pdf',
    lastModified: Date.now(),
    async arrayBuffer() { return bytes.buffer; },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    stream() { const { Readable } = require('stream'); return Readable.from(bytes); },
  } as unknown as File;
  return file;
}

async function main() {
  const f1 = await createPdf('First');
  const f2 = await createPdf('Second');
  const result = await pdfEngine.mergePdfs([f1, f2]);
  const outPath = resolve(__dirname, '../../merged_test.pdf');
  // Convert Blob to Buffer
  const buffer = Buffer.from(await result.blob.arrayBuffer());
  writeFileSync(outPath, buffer);
  console.log('Merged PDF written to', outPath);
}

main().catch(console.error);
