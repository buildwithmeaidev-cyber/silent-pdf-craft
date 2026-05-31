import { useState, useRef, useEffect } from 'react';
import { PenLine, Download, Trash2, Loader2, Type, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import { motion } from 'framer-motion';

const SIGN_MODES = { DRAW: 'draw', TYPE: 'type', UPLOAD: 'upload' };

export default function SignPdf() {
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signMode, setSignMode] = useState(SIGN_MODES.DRAW);
  const [typedName, setTypedName] = useState('');
  const [signFont, setSignFont] = useState('cursive');
  const [signColor, setSignColor] = useState('#1e1b4b');
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [sigPosition, setSigPosition] = useState(null);
  const [saving, setSaving] = useState(false);

  const sigCanvasRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const imgUploadRef = useRef();

  // Init signature canvas
  useEffect(() => {
    if (!sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 400, 150);
    ctx.strokeStyle = signColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, [signColor]);

  // Render PDF page
  useEffect(() => {
    if (!pdfPages.length || !pdfCanvasRef.current) return;
    const canvas = pdfCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (sigPosition && signatureDataUrl) {
        const sigImg = new Image();
        sigImg.onload = () => ctx.drawImage(sigImg, sigPosition.x, sigPosition.y, sigPosition.w, sigPosition.h);
        sigImg.src = signatureDataUrl;
      }
    };
    img.src = pdfPages[currentPage]?.dataUrl;
  }, [pdfPages, currentPage, sigPosition, signatureDataUrl]);

  const handleFile = async (f) => {
    setFile(f);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages } = await loadPdfPages(buf, 1.5);
    setPdfPages(pages);
    setSigPosition(null);
    setCurrentPage(0);
    setLoading(false);
  };

  // Signature canvas draw
  const getSigPos = (e) => {
    const rect = sigCanvasRef.current.getBoundingClientRect();
    const scaleX = sigCanvasRef.current.width / rect.width;
    const scaleY = sigCanvasRef.current.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startSig = (e) => {
    isDrawing.current = true;
    lastPos.current = getSigPos(e);
  };
  const drawSig = (e) => {
    if (!isDrawing.current) return;
    const pos = getSigPos(e);
    const ctx = sigCanvasRef.current.getContext('2d');
    ctx.strokeStyle = signColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };
  const stopSig = () => { isDrawing.current = false; };

  const clearSig = () => {
    if (sigCanvasRef.current) {
      const ctx = sigCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
    }
    setSignatureDataUrl(null);
    setSigPosition(null);
  };

  const saveDrawnSig = () => {
    const dataUrl = sigCanvasRef.current.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
  };

  const saveTypedSig = () => {
    if (!typedName.trim()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, 400, 150);
    ctx.fillStyle = signColor;
    ctx.font = `bold 52px ${signFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, 200, 75);
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  const handleImgUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSignatureDataUrl(ev.target.result);
    reader.readAsDataURL(f);
  };

  const placeSig = (e) => {
    if (!signatureDataUrl) return;
    const canvas = pdfCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setSigPosition({ x: x - 100, y: y - 40, w: 200, h: 80 });
  };

  const exportPdf = async () => {
    if (!file || !signatureDataUrl || !sigPosition) return;
    setSaving(true);
    const buf = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buf);
    const pages = pdfDoc.getPages();
    const pg = pages[currentPage];
    const { width: pW, height: pH } = pg.getSize();
    const canvas = pdfCanvasRef.current;
    const scaleX = pW / canvas.width;
    const scaleY = pH / canvas.height;

    const sigImg = await pdfDoc.embedPng(await fetch(signatureDataUrl).then(r => r.arrayBuffer()));
    pg.drawImage(sigImg, {
      x: sigPosition.x * scaleX,
      y: pH - (sigPosition.y + sigPosition.h) * scaleY,
      width: sigPosition.w * scaleX,
      height: sigPosition.h * scaleY,
    });

    const bytes = await pdfDoc.save();
    downloadFile(bytes, `signed_${file.name}`);
    setSaving(false);
  };

  return (
    <ToolPageLayout icon={PenLine} title="E-Sign PDF" description="Draw, type, or upload your signature and place it on your PDF" color="rose">
      {!file ? (
        <FileUploadZone onFile={handleFile} accept=".pdf" label="Drop your PDF to sign" />
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Signature Panel */}
          <div className="space-y-4">
            <FileUploadZone file={file} onClear={() => { setFile(null); setPdfPages([]); }} />

            {/* Mode Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Signature Type</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: SIGN_MODES.DRAW, label: 'Draw', icon: PenLine },
                  { id: SIGN_MODES.TYPE, label: 'Type', icon: Type },
                  { id: SIGN_MODES.UPLOAD, label: 'Upload', icon: Upload },
                ].map(m => (
                  <button key={m.id} onClick={() => setSignMode(m.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${signMode === m.id ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-rose-50'}`}>
                    <m.icon className="w-4 h-4" />{m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ink Color</p>
              <div className="flex gap-2">
                {['#1e1b4b','#1d4ed8','#065f46','#7f1d1d','#000000'].map(c => (
                  <button key={c} onClick={() => setSignColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${signColor === c ? 'border-rose-500 scale-110' : 'border-slate-200'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Draw Mode */}
            {signMode === SIGN_MODES.DRAW && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Draw Signature</p>
                <canvas
                  ref={sigCanvasRef}
                  width={400} height={150}
                  className="sig-canvas w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl"
                  onMouseDown={startSig} onMouseMove={drawSig} onMouseUp={stopSig} onMouseLeave={stopSig}
                  onTouchStart={startSig} onTouchMove={drawSig} onTouchEnd={stopSig}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={clearSig} className="flex-1 rounded-xl gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </Button>
                  <Button size="sm" onClick={saveDrawnSig} className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white">
                    Use Signature
                  </Button>
                </div>
              </div>
            )}

            {/* Type Mode */}
            {signMode === SIGN_MODES.TYPE && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Type Signature</p>
                <Input value={typedName} onChange={e => setTypedName(e.target.value)} placeholder="Your full name" className="rounded-xl" />
                <div className="grid grid-cols-2 gap-2">
                  {['cursive','Georgia, serif'].map(f => (
                    <button key={f} onClick={() => setSignFont(f)}
                      className={`py-2 rounded-xl text-sm transition-all ${signFont === f ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-600'}`}
                      style={{ fontFamily: f }}
                    >
                      Signature
                    </button>
                  ))}
                </div>
                <Button size="sm" onClick={saveTypedSig} className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white">
                  Use This Signature
                </Button>
              </div>
            )}

            {/* Upload Mode */}
            {signMode === SIGN_MODES.UPLOAD && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Upload Signature</p>
                <input ref={imgUploadRef} type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
                <Button variant="outline" onClick={() => imgUploadRef.current?.click()} className="w-full rounded-xl gap-2">
                  <Upload className="w-4 h-4" /> Choose Image
                </Button>
              </div>
            )}

            {/* Signature Preview */}
            {signatureDataUrl && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
                <p className="text-xs font-semibold text-rose-600 mb-2">Signature Ready</p>
                <img src={signatureDataUrl} alt="Signature" className="h-12 object-contain" />
                <p className="text-xs text-rose-500 mt-2">Click on the PDF page to place your signature</p>
              </div>
            )}

            <Button
              onClick={exportPdf}
              disabled={!signatureDataUrl || !sigPosition || saving}
              className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Download className="w-4 h-4" /> Download Signed PDF</>}
            </Button>
            {!sigPosition && signatureDataUrl && (
              <p className="text-xs text-center text-slate-400">Click on the PDF to place your signature first</p>
            )}
          </div>

          {/* PDF Canvas */}
          <div className="bg-slate-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                Page {currentPage + 1} of {pdfPages.length}
                {signatureDataUrl && !sigPosition && <span className="ml-2 text-rose-500 text-xs">← Click to place signature</span>}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="rounded-xl">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(pdfPages.length - 1, p + 1))} disabled={currentPage === pdfPages.length - 1} className="rounded-xl">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-[70vh] bg-white rounded-xl flex items-start justify-center">
              <canvas
                ref={pdfCanvasRef}
                className="max-w-full"
                style={{ maxHeight: '65vh', width: '100%', cursor: signatureDataUrl ? 'crosshair' : 'default' }}
                onClick={placeSig}
              />
            </div>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}