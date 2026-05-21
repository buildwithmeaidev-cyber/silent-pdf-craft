import { useState } from 'react';
import { FileOutput, Download, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pdfjsLib, fileToArrayBuffer, loadPdfPages, formatFileSize } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

// Extract text from all pages using PDF.js text content API
async function extractPdfText(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    let pageText = '';
    let lastY = null;
    for (const item of items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      }
      pageText += item.str;
      if (item.hasEOL) pageText += '\n';
      lastY = item.transform[5];
    }
    pageTexts.push(pageText.trim());
  }

  return pageTexts;
}

// Build a proper .docx from scratch (OpenXML format as a ZIP)
async function buildDocx(pageTexts, filename) {
  const docName = filename.replace(/\.pdf$/i, '');

  // Build the word/document.xml content
  const paragraphs = pageTexts
    .join('\n\n--- Page Break ---\n\n')
    .split('\n')
    .map(line => {
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const isPageBreak = line.startsWith('--- Page Break ---');
      if (isPageBreak) {
        return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
      }
      if (!line.trim()) return `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>`;
      return `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
    })
    .join('');

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  mc:Ignorable="w14">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t>${docName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r>
    </w:p>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="4F46E5"/></w:rPr>
  </w:style>
</w:styles>`;

  // Build ZIP manually using the zip creation helper
  const files = {
    '[Content_Types].xml': contentTypesXml,
    '_rels/.rels': relsXml,
    'word/document.xml': documentXml,
    'word/styles.xml': stylesXml,
    'word/_rels/document.xml.rels': wordRelsXml,
  };

  return createZipBuffer(files);
}

// Minimal ZIP builder (no external dependency)
function createZipBuffer(files) {
  const encoder = new TextEncoder();
  const localHeaders = [];
  const centralDir = [];
  let offset = 0;

  const crc32 = (data) => {
    let crc = 0xFFFFFFFF;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    for (const byte of data) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const writeUint16LE = (n) => [(n & 0xFF), ((n >> 8) & 0xFF)];
  const writeUint32LE = (n) => [(n & 0xFF), ((n >> 8) & 0xFF), ((n >> 16) & 0xFF), ((n >> 24) & 0xFF)];

  const allParts = [];

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(content);
    const crc = crc32(dataBytes);
    const now = new Date();
    const dosTime = ((now.getSeconds() >> 1) | (now.getMinutes() << 5) | (now.getHours() << 11));
    const dosDate = (now.getDate() | ((now.getMonth() + 1) << 5) | ((now.getFullYear() - 1980) << 9));

    const localHeader = [
      0x50, 0x4B, 0x03, 0x04, // signature
      0x14, 0x00,             // version
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression (stored)
      ...writeUint16LE(dosTime),
      ...writeUint16LE(dosDate),
      ...writeUint32LE(crc),
      ...writeUint32LE(dataBytes.length),
      ...writeUint32LE(dataBytes.length),
      ...writeUint16LE(nameBytes.length),
      0x00, 0x00,             // extra field length
      ...nameBytes,
    ];

    const centralHeader = [
      0x50, 0x4B, 0x01, 0x02, // signature
      0x14, 0x00,             // version made by
      0x14, 0x00,             // version needed
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression
      ...writeUint16LE(dosTime),
      ...writeUint16LE(dosDate),
      ...writeUint32LE(crc),
      ...writeUint32LE(dataBytes.length),
      ...writeUint32LE(dataBytes.length),
      ...writeUint16LE(nameBytes.length),
      0x00, 0x00,             // extra
      0x00, 0x00,             // comment
      0x00, 0x00,             // disk
      0x00, 0x00,             // internal
      0x00, 0x00, 0x00, 0x00, // external
      ...writeUint32LE(offset),
      ...nameBytes,
    ];

    localHeaders.push({ header: localHeader, data: dataBytes });
    centralDir.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  // Build the full zip
  for (const part of localHeaders) {
    allParts.push(new Uint8Array(part.header));
    allParts.push(part.data);
  }

  const centralDirBytes = centralDir.map(c => new Uint8Array(c));
  let centralDirSize = centralDirBytes.reduce((sum, a) => sum + a.length, 0);

  const eocd = [
    0x50, 0x4B, 0x05, 0x06,
    0x00, 0x00, 0x00, 0x00,
    ...writeUint16LE(Object.keys(files).length),
    ...writeUint16LE(Object.keys(files).length),
    ...writeUint32LE(centralDirSize),
    ...writeUint32LE(offset),
    0x00, 0x00,
  ];

  for (const cd of centralDirBytes) allParts.push(cd);
  allParts.push(new Uint8Array(eocd));

  const totalLen = allParts.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const part of allParts) {
    result.set(part, pos);
    pos += part.length;
  }
  return result;
}

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [done, setDone] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const handleFile = async (f) => {
    setFile(f);
    setDone(false);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.8);
    setPages(p);
    setPageCount(p.length);
    setLoading(false);
  };

  const convert = async () => {
    if (!file) return;
    setExtracting(true);
    const buf = await fileToArrayBuffer(file);
    const pageTexts = await extractPdfText(buf);
    const docxBytes = await buildDocx(pageTexts, file.name);
    const outName = file.name.replace(/\.pdf$/i, '') + '.docx';

    const blob = new Blob([docxBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    a.click();
    URL.revokeObjectURL(url);

    setExtracting(false);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <ToolPageLayout icon={FileOutput} title="PDF to Word" description="Extract text from PDF and export as an editable .docx file" color="violet">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left */}
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to convert"
            file={file} onClear={() => { setFile(null); setPages([]); setDone(false); }}
          />

          {file && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Document Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400">File Size</p>
                    <p className="font-semibold text-slate-700 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Pages</p>
                    <p className="font-semibold text-slate-700 text-sm">{pageCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-sm text-violet-700 space-y-1.5">
                <p className="font-semibold">What gets converted:</p>
                <ul className="text-xs space-y-1 text-violet-600">
                  <li>✓ All text content from every page</li>
                  <li>✓ Paragraph structure preserved</li>
                  <li>✓ Page breaks included</li>
                  <li>✓ Output as editable .docx</li>
                </ul>
              </div>

              {done && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Word file downloaded!
                </div>
              )}

              <Button
                onClick={convert}
                disabled={extracting || loading}
                className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2 shadow-lg shadow-violet-500/20"
              >
                {extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</> : <><Download className="w-4 h-4" /> Convert to Word (.docx)</>}
              </Button>
            </>
          )}
        </div>

        {/* Preview */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}