import { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFDocumentEnc } from "@cantoo/pdf-lib";

export class JobCancelledError extends Error {
  constructor(message = "Operation cancelled.") {
    super(message);
    this.name = "JobCancelledError";
  }
}

export function isJobCancelledError(err: unknown): boolean {
  return err instanceof JobCancelledError || (err instanceof Error && err.name === "JobCancelledError");
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new JobCancelledError();
  }
}

export async function yieldToMain(signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, 0);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new JobCancelledError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function readFileBytes(file: File, signal?: AbortSignal): Promise<Uint8Array> {
  throwIfAborted(signal);
  if (!file) throw new Error("No file provided.");
  if (file.size === 0) {
    throw new Error(`${file.name || "This file"} is empty (0 bytes).`);
  }
  const buf = await file.arrayBuffer();
  throwIfAborted(signal);
  return new Uint8Array(buf);
}

export function hasPdfHeader(bytes: Uint8Array): boolean {
  const limit = Math.min(bytes.length, 1024);
  for (let i = 0; i <= limit - 5; i++) {
    if (
      bytes[i] === 0x25 && // %
      bytes[i + 1] === 0x50 && // P
      bytes[i + 2] === 0x44 && // D
      bytes[i + 3] === 0x46 && // F
      bytes[i + 4] === 0x2d // -
    ) {
      return true;
    }
  }
  return false;
}

export interface PdfInputInspection {
  bytes: Uint8Array;
  pageCount: number;
  isEncrypted: boolean;
}

export async function inspectPdfInput(
  file: File,
  options?: { signal?: AbortSignal; password?: string; allowEncrypted?: boolean },
): Promise<PdfInputInspection> {
  const bytes = await readFileBytes(file, options?.signal);
  if (!hasPdfHeader(bytes)) {
    throw new Error(`${file.name} does not appear to be a valid PDF file.`);
  }

  let doc: PDFDocument;
  let isEncrypted = false;
  try {
    doc = await PDFDocument.load(bytes, { throwOnInvalidObject: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/encrypted/i.test(msg)) {
      isEncrypted = true;
      if (options?.allowEncrypted) {
        try {
          const encDoc = await PDFDocumentEnc.load(bytes, {
            password: options.password,
            ignoreEncryption: !options.password,
          });
          throwIfAborted(options?.signal);
          const count = encDoc.getPageCount();
          if (count === 0) throw new Error(`${file.name} contains no readable pages.`);
          return { bytes, pageCount: count, isEncrypted: true };
        } catch (encErr) {
          if (isJobCancelledError(encErr)) throw encErr;
          throw new Error(`${file.name} is password-protected and could not be unlocked.`);
        }
      }
      throw new Error(
        `${file.name} is password-protected or encrypted. Unlock it before processing so pages aren't blanked or lost.`,
      );
    }
    throw new Error(`Couldn't read ${file.name}. The PDF may be corrupted or truncated.`);
  }

  throwIfAborted(options?.signal);
  const pageCount = doc.getPageCount();
  if (pageCount === 0) {
    throw new Error(`${file.name} contains no readable pages.`);
  }
  return { bytes, pageCount, isEncrypted };
}

export async function inspectDocxInput(file: File, signal?: AbortSignal): Promise<Uint8Array> {
  const bytes = await readFileBytes(file, signal);
  // Legacy binary .doc (OLE2 compound file) starts with D0 CF 11 E0
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  ) {
    throw new Error(`${file.name} uses the legacy binary .doc format. Save it as .docx first.`);
  }
  // OOXML .docx is a ZIP archive starting with PK\x03\x04 or PK\x05\x06
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06));
  if (!isZip) {
    throw new Error(`${file.name} is not a valid Word (.docx) document.`);
  }
  return bytes;
}

export interface ImageInputInspection {
  bytes: Uint8Array;
  format: "png" | "jpg" | "other";
}

export async function inspectImageInput(file: File, signal?: AbortSignal): Promise<ImageInputInspection> {
  const bytes = await readFileBytes(file, signal);
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  if (isPng) return { bytes, format: "png" };

  const isJpg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpg) return { bytes, format: "jpg" };

  return { bytes, format: "other" };
}

export interface PdfOutputExpectation {
  expectedPageCount?: number;
  expectedMinPageCount?: number;
  expectedRotations?: Record<number, number>; // 0-indexed pageIndex -> expected angle (0|90|180|270)
  encrypted?: boolean;
  password?: string;
  expectedMaxBytes?: number;
}

export async function verifyPdfOutput(
  blob: Blob,
  expect?: PdfOutputExpectation,
): Promise<{ pageCount: number; byteSize: number }> {
  if (!blob || blob.size === 0) {
    throw new Error("Generated PDF is empty (0 bytes).");
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (!hasPdfHeader(bytes)) {
    throw new Error("Output validation failed: missing PDF header signature.");
  }
  if (expect?.expectedMaxBytes !== undefined && bytes.length > expect.expectedMaxBytes) {
    throw new Error("Output validation failed: compressed output exceeded allowed byte size.");
  }

  if (expect?.encrypted) {
    let loadedPlain = false;
    try {
      await PDFDocument.load(bytes);
      loadedPlain = true;
    } catch {
      loadedPlain = false;
    }
    if (loadedPlain) {
      throw new Error("Output validation failed: PDF was not encrypted.");
    }

    if (expect.password) {
      const unlocked = await PDFDocumentEnc.load(bytes, { password: expect.password });
      const pageCount = unlocked.getPageCount();
      if (pageCount <= 0) {
        throw new Error("Output validation failed: encrypted PDF has zero pages.");
      }
      if (expect.expectedPageCount !== undefined && pageCount !== expect.expectedPageCount) {
        throw new Error(
          `Output validation failed: expected ${expect.expectedPageCount} pages, got ${pageCount}.`,
        );
      }
      return { pageCount, byteSize: bytes.length };
    }
    return { pageCount: expect.expectedPageCount ?? 1, byteSize: bytes.length };
  }

  let parsed: PDFDocument;
  try {
    parsed = await PDFDocument.load(bytes, { throwOnInvalidObject: false });
  } catch {
    throw new Error("Output validation failed: generated PDF could not be parsed cleanly.");
  }

  const pageCount = parsed.getPageCount();
  if (pageCount <= 0) {
    throw new Error("Output validation failed: generated PDF has zero pages.");
  }
  if (expect?.expectedPageCount !== undefined && pageCount !== expect.expectedPageCount) {
    throw new Error(
      `Output validation failed: expected ${expect.expectedPageCount} pages, got ${pageCount}.`,
    );
  }
  if (expect?.expectedMinPageCount !== undefined && pageCount < expect.expectedMinPageCount) {
    throw new Error(
      `Output validation failed: expected at least ${expect.expectedMinPageCount} pages, got ${pageCount}.`,
    );
  }
  if (expect?.expectedRotations) {
    const pages = parsed.getPages();
    for (const [idxStr, rawExpected] of Object.entries(expect.expectedRotations)) {
      const idx = Number(idxStr);
      if (idx < 0 || idx >= pages.length) {
        throw new Error(`Output validation failed: missing page ${idx + 1} for rotation check.`);
      }
      const expectedAngle = ((rawExpected % 360) + 360) % 360;
      const actualAngle = (((pages[idx].getRotation().angle || 0) % 360) + 360) % 360;
      if (actualAngle !== expectedAngle) {
        throw new Error(
          `Output validation failed: page ${idx + 1} rotation is ${actualAngle}°, expected ${expectedAngle}°.`,
        );
      }
    }
  }

  return { pageCount, byteSize: bytes.length };
}

export async function verifyDocxOutput(blob: Blob): Promise<{ entries: string[]; byteSize: number }> {
  if (!blob || blob.size === 0) {
    throw new Error("Generated Word document is empty (0 bytes).");
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    throw new Error("Output validation failed: generated .docx is not a valid ZIP archive.");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let endRecord = -1;
  const searchMin = Math.max(0, bytes.length - 65_557);
  for (let offset = bytes.length - 22; offset >= searchMin; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endRecord = offset;
      break;
    }
  }
  if (endRecord < 0) {
    throw new Error("Output validation failed: DOCX archive directory was not found.");
  }

  const entryCount = view.getUint16(endRecord + 10, true);
  let entryOffset = view.getUint32(endRecord + 16, true);
  const decoder = new TextDecoder();
  const entries: string[] = [];
  let docXmlSize = 0;

  for (let i = 0; i < entryCount; i++) {
    if (entryOffset + 46 > bytes.length || view.getUint32(entryOffset, true) !== 0x02014b50) {
      throw new Error("Output validation failed: corrupted DOCX central directory.");
    }
    const compressedSize = view.getUint32(entryOffset + 20, true);
    const uncompressedSize = view.getUint32(entryOffset + 24, true);
    const nameLen = view.getUint16(entryOffset + 28, true);
    const extraLen = view.getUint16(entryOffset + 30, true);
    const commentLen = view.getUint16(entryOffset + 32, true);
    const name = decoder.decode(bytes.slice(entryOffset + 46, entryOffset + 46 + nameLen));
    entries.push(name);
    if (name === "word/document.xml") {
      docXmlSize = Math.max(compressedSize, uncompressedSize);
    }
    entryOffset += 46 + nameLen + extraLen + commentLen;
  }

  if (!entries.includes("[Content_Types].xml") || !entries.includes("word/document.xml") || docXmlSize <= 0) {
    throw new Error("Output validation failed: DOCX package is missing required XML content.");
  }

  return { entries, byteSize: bytes.length };
}

export async function destroyPdfProxy(
  doc?: {
    cleanup?: (keepLoadedFonts?: boolean) => Promise<unknown>;
    destroy?: () => Promise<unknown>;
    loadingTask?: { destroy?: () => Promise<unknown> };
  } | null,
  loadingTask?: { destroy?: () => Promise<unknown> } | null,
): Promise<void> {
  try {
    await doc?.cleanup?.();
  } catch {
    // ignore cleanup errors on already-torn-down proxies
  }
  try {
    await doc?.destroy?.();
  } catch {
    // pdfjs-dist v6 moved destroy() onto PDFDocumentLoadingTask
  }
  try {
    await (loadingTask ?? doc?.loadingTask)?.destroy?.();
  } catch {
    // ignore destroy errors if already aborted
  }
}
