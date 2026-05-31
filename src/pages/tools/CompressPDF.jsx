import { useState } from 'react';
import { Minimize2, Download, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import { pdfjsLib, fileToArrayBuffer, downloadFile, loadPdfPages, formatFileSize } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

const QUALITY_LEVELS = [
  { id: 'low', label: 'Maximum Compression', desc: 'Smallest size, lower quality', imgQuality: 0.4, scale: 0.8 },
  { id: 'medium', label: 'Balanced', desc: 'Good balance of size & quality', imgQuality: 0.65, scale: 1.0 },
  { id: 'high', label: 'High Quality', desc: 'Best quality, moderate compression', imgQuality: 0.85, scale: 1.2 },
];

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState('medium');
  const [result, setResult] = useState(null); // { originalSize, compressedSize, savedPercent }

  const handleFile = async (f) => {
    setFile(f);
    setResult(null);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.8);
    setPages(p);
    setLoading(false);
  };

  const compress = async () => {
    if (!file) return;
    setCompressing(true);
    const q = QUALITY_LEVELS.find(l => l.id === quality);
    const buf = await fileToArrayBuffer(file);

    // Re-render all pages as compressed JPEG and rebuild PDF
    const pdfSrc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= pdfSrc.numPages; i++) {
      const page = await pdfSrc.getPage(i);
      const viewport = page.getViewport({ scale: q.scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', q.imgQuality);
      const imgBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
      const embImg = await newDoc.embedJpg(imgBytes);
      const newPage = newDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embImg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }

    const bytes = await newDoc.save();
    const savedPercent = Math.round((1 - bytes.byteLength / file.size) * 100);
    setResult({ originalSize: file.size, compressedSize: bytes.byteLength, savedPercent });
    downloadFile(bytes, `compressed_${file.name}`);
    setCompressing(false);
  };

  return (
    <ToolPageLayout icon={Minimize2} title="Compress PDF" description="Reduce PDF file size while maintaining readability" color="emerald">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left */}
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to compress"
            file={file} onClear={() => { setFile(null); setPages([]); setResult(null); }}
          />

          {file && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Compression Level</p>
                <div className="space-y-2">
                  {QUALITY_LEVELS.map(l => (
                    <button key={l.id} onClick={() => setQuality(l.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${quality === l.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}>
                      <p className={`font-semibold text-sm ${quality === l.id ? 'text-emerald-700' : 'text-slate-700'}`}>{l.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {result && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" /> Compressed Successfully!
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-slate-400">Original</p>
                      <p className="font-bold text-slate-700">{formatFileSize(result.originalSize)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-slate-400">Compressed</p>
                      <p className="font-bold text-emerald-600">{formatFileSize(result.compressedSize)}</p>
                    </div>
                  </div>
                  <p className="text-emerald-700 font-bold text-center">
                    {result.savedPercent > 0 ? `${result.savedPercent}% smaller!` : 'Already optimized'}
                  </p>
                </div>
              )}

              <Button
                onClick={compress}
                disabled={compressing}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-lg shadow-emerald-500/20"
              >
                {compressing ? <><Loader2 className="w-4 h-4 animate-spin" /> Compressing...</> : <><Download className="w-4 h-4" /> Compress & Download</>}
              </Button>
            </>
          )}
        </div>

        {/* Preview */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
