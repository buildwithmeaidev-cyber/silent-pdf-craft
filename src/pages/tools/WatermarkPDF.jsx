import { useState } from 'react';
import { Stamp, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

export default function WatermarkPdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.2);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [colorHex, setColorHex] = useState('#64748b');
  const [position, setPosition] = useState('center');

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const handleFile = async (f) => {
    setFile(f);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.8);
    setPages(p);
    setLoading(false);
  };

  const apply = async () => {
    setSaving(true);
    const buf = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buf);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { r, g, b } = hexToRgb(colorHex);
    const pdfPages = pdfDoc.getPages();

    for (const pg of pdfPages) {
      const { width, height } = pg.getSize();
      const textW = font.widthOfTextAtSize(text, fontSize);
      let x = width / 2 - textW / 2;
      let y = height / 2;
      if (position === 'top') y = height - 80;
      if (position === 'bottom') y = 60;

      pg.drawText(text, {
        x, y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(rotation),
      });
    }

    const bytes = await pdfDoc.save();
    downloadFile(bytes, `watermarked_${file.name}`);
    setSaving(false);
  };

  const POSITIONS = [
    { id: 'top', label: 'Top' },
    { id: 'center', label: 'Center' },
    { id: 'bottom', label: 'Bottom' },
  ];

  return (
    <ToolPageLayout icon={Stamp} title="Watermark PDF" description="Add custom text watermarks to protect your PDF documents" color="amber">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to watermark"
            file={file} onClear={() => { setFile(null); setPages([]); }}
          />

          {file && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <p className="font-semibold text-slate-800 text-sm">Watermark Settings</p>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Watermark Text</label>
                  <Input value={text} onChange={e => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL" className="rounded-xl" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Color</label>
                  <div className="flex gap-2">
                    {['#64748b','#4F46E5','#ef4444','#10b981','#000000'].map(c => (
                      <button key={c} onClick={() => setColorHex(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${colorHex === c ? 'border-orange-500 scale-110' : 'border-slate-200'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <Input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                    Opacity: {Math.round(opacity * 100)}%
                  </label>
                  <input type="range" min="5" max="80" value={Math.round(opacity * 100)} onChange={e => setOpacity(Number(e.target.value) / 100)}
                    className="w-full accent-orange-500" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                    Font Size: {fontSize}px
                  </label>
                  <input type="range" min="16" max="96" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-orange-500" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                    Rotation: {rotation}°
                  </label>
                  <input type="range" min="0" max="90" value={rotation} onChange={e => setRotation(Number(e.target.value))}
                    className="w-full accent-orange-500" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {POSITIONS.map(p => (
                      <button key={p.id} onClick={() => setPosition(p.id)}
                        className={`py-2 rounded-xl text-sm font-medium transition-all ${position === p.id ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-orange-50'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center" style={{ minHeight: 120 }}>
                <p style={{
                  fontSize: `${Math.max(14, fontSize * 0.5)}px`,
                  color: colorHex,
                  opacity,
                  transform: `rotate(-${rotation}deg)`,
                  fontWeight: 'bold',
                  fontFamily: 'sans-serif',
                  letterSpacing: '0.05em',
                  userSelect: 'none',
                }}>{text || 'Preview'}</p>
              </div>

              <Button
                onClick={apply}
                disabled={saving || !text.trim()}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-2 shadow-lg shadow-orange-500/20"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</> : <><Download className="w-4 h-4" /> Download with Watermark</>}
              </Button>
            </>
          )}
        </div>

        {/* Preview */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}