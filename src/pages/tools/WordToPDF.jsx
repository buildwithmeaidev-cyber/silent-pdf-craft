import { useState, useRef } from 'react';
import { FileText, Download, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadFile, formatFileSize } from '@/utils/pdfUtils';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Parse .docx content from the raw XML (no server, pure browser)
async function parseDocxText(file) {
  // Use JSZip-like approach via native zip parsing
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // Find document.xml inside the zip (DOCX is a ZIP)
  // We'll decode text from the central directory
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(uint8);

  // Extract text between XML tags from document.xml portion
  // Find the document.xml content
  const xmlStart = content.indexOf('<?xml');
  let docXml = '';

  // Try to find the word/document.xml marker in the zip
  const docXmlMarker = 'word/document.xml';
  const markerIdx = content.indexOf(docXmlMarker);

  if (markerIdx !== -1) {
    // The XML content follows after zip local file header
    const xmlSearchFrom = markerIdx + docXmlMarker.length + 30;
    const xmlStartIdx = content.indexOf('<?xml', xmlSearchFrom);
    if (xmlStartIdx !== -1) {
      docXml = content.substring(xmlStartIdx, xmlStartIdx + 500000);
    }
  }

  if (!docXml) {
    // Fallback: search for paragraph content anywhere
    docXml = content;
  }

  // Strip XML tags and extract text
  const withoutTags = docXml
    .replace(/<w:p[ >]/g, '\n')  // paragraph = newline
    .replace(/<w:br[^>]*/g, '\n') // line break
    .replace(/<[^>]+>/g, '')       // remove all other tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('<?') && !l.startsWith('PK'));

  return docXml.length > 100 ? docXml : null;
}

function extractLinesFromXml(xml) {
  if (!xml) return ['[Could not extract text from this document]'];
  const withParagraphs = xml
    .replace(/<w:p[ >]/g, '\n§PARA§')
    .replace(/<w:br[^>]*/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\r/g, '');

  return withParagraphs
    .split('\n')
    .map(l => l.replace('§PARA§', '').trim())
    .filter(l => l.length > 0 && !l.match(/^[A-Za-z0-9+/]{20,}$/)); // filter base64
}

export default function WordToPdf() {
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState('');

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['doc', 'docx', 'txt', 'rtf'].includes(ext)) return;
    setFile(f);
    setDone(false);

    // Generate text preview
    if (ext === 'txt') {
      const text = await f.text();
      setPreview(text.slice(0, 2000));
    } else if (ext === 'docx') {
      const xml = await parseDocxText(f);
      const lines = extractLinesFromXml(xml);
      setPreview(lines.slice(0, 50).join('\n'));
    } else {
      setPreview(`File: ${f.name}\nSize: ${formatFileSize(f.size)}\n\nClick "Convert to PDF" to process this file.`);
    }
  };

  const convert = async () => {
    if (!file) return;
    setConverting(true);

    const ext = file.name.split('.').pop().toLowerCase();
    let lines = [];

    if (ext === 'txt') {
      const text = await file.text();
      // Word-wrap lines at 85 chars
      text.split('\n').forEach(line => {
        if (line.length <= 85) {
          lines.push(line);
        } else {
          const words = line.split(' ');
          let current = '';
          words.forEach(word => {
            if ((current + ' ' + word).trim().length > 85) {
              lines.push(current.trim());
              current = word;
            } else {
              current = (current + ' ' + word).trim();
            }
          });
          if (current) lines.push(current);
        }
      });
    } else if (ext === 'docx') {
      const xml = await parseDocxText(file);
      const rawLines = extractLinesFromXml(xml);
      rawLines.forEach(line => {
        if (line.length <= 85) {
          lines.push(line);
        } else {
          const words = line.split(' ');
          let current = '';
          words.forEach(word => {
            if ((current + ' ' + word).trim().length > 85) {
              lines.push(current.trim());
              current = word;
            } else {
              current = (current + ' ' + word).trim();
            }
          });
          if (current) lines.push(current);
        }
      });
    } else {
      // RTF / DOC: strip RTF codes and output raw text
      const raw = await file.text();
      const stripped = raw.replace(/\{[^{}]*\}|\\[a-z]+\d*\s?|[{}]/g, ' ').replace(/\s+/g, ' ').trim();
      lines = stripped.match(/.{1,85}(\s|$)/g) || [stripped];
    }

    // Sanitize lines: strip characters WinAnsi can't encode (control chars, non-latin)
    const sanitize = (str) => str.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
    lines = lines.map(sanitize);

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const lineHeight = 16;
    const margin = 60;
    const pageWidth = 595;  // A4
    const pageHeight = 842;
    const usableHeight = pageHeight - margin * 2;
    const linesPerPage = Math.floor(usableHeight / lineHeight);

    // Title line
    const titleLines = [`Document: ${file.name.replace(/\.(docx?|txt|rtf)$/i, '')}`, ''];
    const allLines = [...titleLines, ...lines];

    for (let p = 0; p < Math.ceil(allLines.length / linesPerPage); p++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const chunk = allLines.slice(p * linesPerPage, (p + 1) * linesPerPage);
      chunk.forEach((line, i) => {
        const y = pageHeight - margin - (i * lineHeight);
        const isTitle = p === 0 && i === 0;
        page.drawText(line || ' ', {
          x: margin,
          y,
          size: isTitle ? 14 : fontSize,
          font,
          color: isTitle ? rgb(0.31, 0.27, 0.9) : rgb(0.1, 0.1, 0.1),
          maxWidth: pageWidth - margin * 2,
        });
      });

      // Page number
      page.drawText(`Page ${p + 1}`, {
        x: pageWidth / 2 - 20,
        y: margin / 2,
        size: 9,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });
    }

    const bytes = await pdfDoc.save();
    const outName = file.name.replace(/\.(docx?|txt|rtf)$/i, '') + '.pdf';
    downloadFile(bytes, outName);
    setConverting(false);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <ToolPageLayout icon={FileText} title="Word to PDF" description="Convert DOC, DOCX, and TXT files to PDF in your browser" color="sky">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-12 text-center cursor-pointer hover:bg-sky-50/50 transition-all"
        >
          <input ref={inputRef} type="file" accept=".doc,.docx,.txt,.rtf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-sky-600" />
          </div>
          <p className="font-semibold text-slate-700 text-lg">Drop your Word document here</p>
          <p className="text-sm text-slate-400 mt-1">Supports .docx, .doc, .txt, .rtf</p>
        </div>

        {/* File Card */}
        <AnimatePresence>
          {file && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setPreview(''); setDone(false); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Preview */}
                {preview && (
                  <div className="p-4 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Document Preview</p>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-48 overflow-auto">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{preview}</pre>
                    </div>
                  </div>
                )}

                {/* Convert Button */}
                <div className="p-4">
                  {done && (
                    <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> PDF downloaded successfully!
                    </div>
                  )}
                  <Button
                    onClick={convert}
                    disabled={converting}
                    className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-2 shadow-lg shadow-sky-500/20"
                  >
                    {converting ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</> : <><Download className="w-4 h-4" /> Convert to PDF</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Browser-Only', desc: 'Your file never leaves your device' },
            { title: 'Preserves Text', desc: 'Extracts and formats document content' },
            { title: 'Multi-format', desc: 'DOCX, DOC, TXT, RTF supported' },
          ].map(item => (

            <div key={item.title} className="text-center">
              <p className="font-semibold text-sky-700 text-sm">{item.title}</p>
              <p className="text-xs text-sky-600 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  );
}