import { useState } from 'react';
import { Eraser, Download, Loader2, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages, formatFileSize } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

export default function RemoveWatermark() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [brighten, setBrighten] = useState(true);
  const [removeAnnotations, setRemoveAnnotations] = useState(true);
  const [contrast, setContrast] = useState(1.1);

  const handleFile = async (f) => {
    setFile(f);
    setDone(false);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.8);
    setPages(p);
    setLoading(false);
  };

  const process = async () => {
    if (!file) return;
    setProcessing(true);

    const buf = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pdfPages = pdfDoc.getPages();

    // Remove annotations (overlays, stamps) from each page
    if (removeAnnotations) {
      for (const page of pdfPages) {
        try {
          const annots = page.node.lookup(page.node.pdf.context.obj('Annots'));
          if (annots) page.node.delete(page.node.pdf.context.obj('Annots'));
        } catch {
          // ignore if no annotations
        }
      }
    }

    // Re-render pages through canvas with brightness/contrast filter to lighten watermark remnants
    if (brighten) {
      const { pdfjsLib } = await import('@/utils/pdfUtils');
      const pdfSrc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
      const newDoc = await PDFDocument.create();

      for (let i = 1; i <= pdfSrc.numPages; i++) {
        const page = await pdfSrc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        // Apply brightness/contrast filter
        ctx.filter = `brightness(${1 + (contrast - 1) * 0.5}) contrast(${contrast})`;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const imgBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
        const embImg = await newDoc.embedJpg(imgBytes);
        const newPage = newDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embImg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      }

      const bytes = await newDoc.save();
      downloadFile(bytes, `watermark-removed_${file.name}`);
    } else {
      const bytes = await pdfDoc.save();
      downloadFile(bytes, `watermark-removed_${file.name}`);
    }

    setProcessing(false);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <ToolPageLayout icon={Eraser} title="Remove Watermark" description="Remove watermarks and stamps from PDF pages" color="rose">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to clean"
            file={file} onClear={() => { setFile(null); setPages([]); setDone(false); }}
          />

          {file && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Options</p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${removeAnnotations ? 'bg-rose-500' : 'bg-slate-200'}`}
                    onClick={() => setRemoveAnnotations(v => !v)}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${removeAnnotations ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Remove Annotation Stamps</p>
                    <p className="text-xs text-slate-400">Strips overlaid stamp/text annotations</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${brighten ? 'bg-rose-500' : 'bg-slate-200'}`}
                    onClick={() => setBrighten(v => !v)}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${brighten ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Lighten Faint Watermarks</p>
                    <p className="text-xs text-slate-400">Brighten/contrast filter to fade image watermarks</p>
                  </div>
                </label>

                {brighten && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contrast Enhancement: {contrast.toFixed(1)}x</p>
                    <input type="range" min="1.0" max="2.0" step="0.1" value={contrast}
                      onChange={e => setContrast(parseFloat(e.target.value))}
                      className="w-full accent-rose-500" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Subtle</span><span>Aggressive</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 text-xs text-amber-700">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Digitally embedded vector watermarks cannot be removed without re-rendering the page. This tool handles annotations and faded image watermarks best.</span>
              </div>

              {done && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> PDF processed and downloaded!
                </div>
              )}

              <Button onClick={process} disabled={processing || loading}
                className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2 shadow-lg shadow-rose-500/20">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Download className="w-4 h-4" /> Remove & Download</>}
              </Button>
            </>
          )}
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}