import { inflateRawSync } from "node:zlib";
import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";
import DOMMatrixShim from "dommatrix";
import { resolve } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { getPdfJs, pdfToWord, wordToPdf } from "./pdf";

Object.defineProperty(globalThis, "Blob", { configurable: true, value: NodeBlob });
Object.defineProperty(globalThis, "File", { configurable: true, value: NodeFile });
Object.defineProperty(globalThis, "DOMMatrix", { configurable: true, value: DOMMatrixShim });

async function preparePdfJs() {
  const pdfjs = await getPdfJs();
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
  ).href;
}

async function makePdfFixture(): Promise<File> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const firstPage = pdf.addPage([612, 792]);
  firstPage.drawText("Conversion report", { x: 54, y: 740, size: 18, font });
  firstPage.drawText("- Review the draft", { x: 54, y: 710, size: 12, font });
  firstPage.drawText("1. Approve the final copy", { x: 54, y: 690, size: 12, font });
  firstPage.drawText("Item", { x: 54, y: 650, size: 12, font });
  firstPage.drawText("Status", { x: 250, y: 650, size: 12, font });
  firstPage.drawText("Résumé", { x: 54, y: 632, size: 12, font });
  firstPage.drawText("Ready", { x: 250, y: 632, size: 12, font });
  firstPage.drawText("Café déjà vu", { x: 54, y: 600, size: 12, font });

  const secondPage = pdf.addPage([612, 792]);
  secondPage.drawText("Page two marker", { x: 54, y: 740, size: 12, font });

  const bytes = await pdf.save();
  return new NodeFile([bytes], "conversion-fixture.pdf", { type: "application/pdf" });
}

async function makeWordFixture(includePaginationContent = false): Promise<File> {
  const body = [
    new Paragraph({ text: "Conversion report", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ children: [new TextRun("Unicode: “Café” — déjà vu → € 😀")] }),
    new Paragraph({ text: "Collect the source files", bullet: { level: 0 } }),
    new Paragraph({ text: "Review the output", bullet: { level: 0 } }),
    new Paragraph({ text: "First ordered action", numbering: { reference: "ordered-actions", level: 0 } }),
    new Paragraph({ text: "Second ordered action", numbering: { reference: "ordered-actions", level: 0 } }),
    new Table({
      rows: [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph("Owner")] }),
          new TableCell({ children: [new Paragraph("Status")] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph("Priya")] }),
          new TableCell({ children: [new Paragraph("Ready")] }),
        ] }),
      ],
    }),
  ];

  if (includePaginationContent) {
    for (let index = 0; index < 100; index += 1) {
      body.push(new Paragraph({ text: `Pagination paragraph ${index + 1}: ${"word ".repeat(18)}` }));
    }
    body.push(new Paragraph({ text: "Final page marker" }));
  }

  const document = new Document({
    numbering: {
      config: [{
        reference: "ordered-actions",
        levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "left" }],
      }],
    },
    sections: [{ children: body }],
  });
  const bytes = await Packer.toBuffer(document);
  return new NodeFile([bytes], "conversion-fixture.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

async function extractPdfText(blob: Blob): Promise<{ pageCount: number; pages: string[] }> {
  await preparePdfJs();
  const pdfjs = await getPdfJs();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
  }

  await pdf.destroy();
  return { pageCount: pages.length, pages };
}

async function readDocumentXml(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let endRecord = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65_557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endRecord = offset;
      break;
    }
  }
  if (endRecord < 0) throw new Error("DOCX archive directory was not found.");

  const entryCount = view.getUint16(endRecord + 10, true);
  let entryOffset = view.getUint32(endRecord + 16, true);
  const decoder = new TextDecoder();

  for (let entry = 0; entry < entryCount; entry += 1) {
    if (view.getUint32(entryOffset, true) !== 0x02014b50) throw new Error("Invalid DOCX archive entry.");
    const method = view.getUint16(entryOffset + 10, true);
    const compressedSize = view.getUint32(entryOffset + 20, true);
    const filenameLength = view.getUint16(entryOffset + 28, true);
    const extraLength = view.getUint16(entryOffset + 30, true);
    const commentLength = view.getUint16(entryOffset + 32, true);
    const localOffset = view.getUint32(entryOffset + 42, true);
    const filename = decoder.decode(bytes.slice(entryOffset + 46, entryOffset + 46 + filenameLength));

    if (filename === "word/document.xml") {
      const localFilenameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataOffset = localOffset + 30 + localFilenameLength + localExtraLength;
      const compressedData = bytes.slice(dataOffset, dataOffset + compressedSize);
      const xmlBytes = method === 0 ? compressedData : inflateRawSync(compressedData);
      return decoder.decode(xmlBytes);
    }

    entryOffset += 46 + filenameLength + extraLength + commentLength;
  }

  throw new Error("DOCX document content was not found.");
}

describe("PDF to Word conversion", () => {
  it("keeps list items, table-cell text, and accented Unicode", async () => {
    await preparePdfJs();
    const result = await pdfToWord(await makePdfFixture());
    const mammoth = await import("mammoth");
    const { value: html } = await mammoth.convertToHtml({
      arrayBuffer: new Uint8Array(await result.blob.arrayBuffer()),
    });

    expect(result.filename).toBe("conversion-fixture.docx");
    expect(html).toContain("Review the draft");
    expect(html).toContain("Approve the final copy");
    expect(html).toContain("Item");
    expect(html).toContain("Ready");
    expect(html).toContain("Café déjà vu");
    expect(html).toContain("Page two marker");
  });

  it("writes a page break between source PDF pages", async () => {
    await preparePdfJs();
    const result = await pdfToWord(await makePdfFixture());
    const xml = await readDocumentXml(result.blob);

    expect(xml.match(/w:type="page"/g)).toHaveLength(1);
  });
});

describe("Word to PDF conversion", () => {
  it("renders lists and table cells while normalizing unsupported Unicode", async () => {
    const result = await wordToPdf(await makeWordFixture());
    const { pages } = await extractPdfText(result.blob);
    const text = pages.join(" ");

    expect(result.filename).toBe("conversion-fixture.pdf");
    expect(text).toContain("• Collect the source files");
    expect(text).toContain("• Review the output");
    expect(text).toContain("1. First ordered action");
    expect(text).toContain("2. Second ordered action");
    expect(text).toContain("Owner");
    expect(text).toContain("Priya");
    expect(text).toContain("|");
    expect(text).toContain('"Café" - déjà vu -> EUR ?');
  });

  it("creates additional PDF pages for long documents and retains the final content", async () => {
    const result = await wordToPdf(await makeWordFixture(true));
    const { pageCount, pages } = await extractPdfText(result.blob);

    expect(pageCount).toBeGreaterThan(1);
    expect(pages.at(-1)).toContain("Final page marker");
  });
});