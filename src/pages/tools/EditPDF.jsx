import { useState, useRef, useEffect } from 'react';
import { Pencil, Type, Download, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { pdfjsLib, fileToArrayBuffer, downloadFile, loadPdfPages } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MODES = { DRAW: 'draw', TEXT: 'text' };

export default function EditPdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(MODES.DRAW);
  const [color, setColor] = useState('#4F46E5');
  const [lineWidth, setLineWidth] = useState(3);
  const [textInput, setTextInput] = useState('');
  const [textSize, setTextSize] = useState(18);
  const [annotations, setAnnotations] = useState({});
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  const handleFile = async (f) => {
    setFile(f);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 1.5);
    setPages(p);
    setAnnotations({});
    setCurrentPage(0);
    setLoading(false);
  };

  useEffect(() => {
    if (!pages.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const ann = annotations[currentPage] || [];
      ann.forEach(a => {
        if (a.type === 'draw') {
          ctx.strokeStyle = a.color;
          ctx.lineWidth = a.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          a.points.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }
        if (a.type === 'text') {
          ctx.fillStyle = a.color;
          ctx.font = `${a.size}px sans-serif`;
          ctx.fillText(a.text, a.x, a.y);
        }
      });
    };
    img.src = pages[currentPage].dataUrl;
  }, [pages, currentPage, annotations]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    if (mode !== MODES.DRAW) return;
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    setAnnotations(prev => {
      const pageAnns = [...(prev[currentPage] || []), { type: 'draw', color, width: lineWidth, points: [pos] }];
      return { ...prev, [currentPage]: pageAnns };
    });
  };

  const doDraw = (e) => {
    if (!isDrawing.current || mode !== MODES.DRAW) return;
    const pos = getPos(e);
    setAnnotations(prev => {
      const pageAnns = [...(prev[currentPage] || [])];
      if (!pageAnns.length) return prev;
      const last = { ...pageAnns[pageAnns.length - 1] };
      last.points = [...last.points, pos];
      pageAnns[pageAnns.length - 1] = last;
      return { ...prev, [currentPage]: pageAnns };
    });
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { isDrawing.current = false; };

  const addText = (e) => {
    if (mode !== MODES.TEXT || !textInput.trim()) return;
    const pos = getPos(e);
    setAnnotations(prev => {
      const pageAnns = [...(prev[currentPage] || []), { type: 'text', text: textInput, x: pos.x, y: pos.y, color, size: textSize }];
      return { ...prev, [currentPage]: pageAnns };
    });
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `${textSize}px sans-serif`;
    ctx.fillText(textInput, pos.x, pos.y);
  };

  const undoLast = () => {
    setAnnotations(prev => {
      const pageAnns = [...(prev[currentPage] || [])];
      pageAnns.pop();
      return { ...prev, [currentPage]: pageAnns };
    });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const ann = annotations[currentPage]?.slice(0, -1) || [];
      ann.forEach(a => {
        if (a.type === 'draw') {
          ctx.strokeStyle = a.color; ctx.lineWidth = a.width; ctx.lineCap = 'round';
          ctx.beginPath();
          a.points.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }
        if (a.type === 'text') {
          ctx.fillStyle = a.color; ctx.font = `${a.size}px sans-serif`;
          ctx.fillText(a.text, a.x, a.y);
        }
      });
    };
    img.src = pages[currentPage].dataUrl;
  };

  const exportPdf = async () => {
    const buf = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buf);
    const pdfPages = pdfDoc.getPages();
    for (const [pgIdx, anns] of Object.entries(annotations)) {
      const pg = pdfPages[Number(pgIdx)];
      if (!pg) continue;
      const { width: pW, height: pH } = pg.getSize();
      const canvasPg = document.createElement('canvas');
      const imgEl = new Image();
      await new Promise(r => { imgEl.onload = r; imgEl.src = pages[Number(pgIdx)].dataUrl; });
      canvasPg.width = imgEl.width; canvasPg.height = imgEl.height;
      const ctx = canvasPg.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);
      anns.forEach(a => {
        if (a.type === 'draw') {
          ctx.strokeStyle = a.color; ctx.lineWidth = a.width; ctx.lineCap = 'round';
          ctx.beginPath();
          a.points.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }
        if (a.type === 'text') {
          ctx.fillStyle = a.color; ctx.font = `${a.size}px sans-serif`;
          ctx.fillText(a.text, a.x, a.y);
        }
      });
      const dataUrl = canvasPg.toDataURL('image/jpeg', 0.9);
      const imgBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
      const img = await pdfDoc.embedJpg(imgBytes);
      pg.drawImage(img, { x: 0, y: 0, width: pW, height: pH });
    }
    const bytes = await pdfDoc.save();
    downloadFile(bytes, `edited_${file.name}`);
  };

  const COLORS = ['#4F46E5','#EC4899','#10B981','#F59E0B','#EF4444','#0EA5E9','#000000','#FFFFFF'];

  return (
    <ToolPageLayout icon={Pencil} title="Edit PDF" description="Draw, annotate, and add text to any PDF page" color="indigo">
      {!file ? (
        <FileUploadZone onFile={handleFile} accept=".pdf" label="Drop your PDF here to start editing" />
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Loading PDF pages...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Tools */}
          <div className="space-y-4">
            {/* File Info */}
            <FileUploadZone file={file} onClear={() => { setFile(null); setPages([]); }} />

            {/* Mode */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tool</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: MODES.DRAW, icon: Pencil, label: 'Draw' }, { id: MODES.TEXT, icon: Type, label: 'Text' }].map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === m.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    <m.icon className="w-4 h-4" />{m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-indigo-500 scale-110' : 'border-slate-200'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-full cursor-pointer rounded-xl" />
            </div>

            {/* Draw Size */}
            {mode === MODES.DRAW && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Brush Size: {lineWidth}px</p>
                <input type="range" min="1" max="20" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600" />
              </div>
            )}

            {/* Text Input */}
            {mode === MODES.TEXT && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Text Content</p>
                <Input value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Type text here..." className="rounded-xl" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Size: {textSize}px</p>
                <input type="range" min="10" max="72" value={textSize} onChange={e => setTextSize(Number(e.target.value))}
                  className="w-full accent-indigo-600" />
                <p className="text-xs text-slate-400">Click on the PDF to place text</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" onClick={undoLast} className="w-full rounded-xl gap-2">
                <RotateCcw className="w-4 h-4" /> Undo
              </Button>
              <Button onClick={exportPdf} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                <Download className="w-4 h-4" /> Save PDF
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="bg-slate-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                Page {currentPage + 1} of {pages.length}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0} className="rounded-xl">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(pages.length-1, p+1))} disabled={currentPage === pages.length - 1} className="rounded-xl">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-[70vh] bg-white rounded-xl flex items-start justify-center">
              <canvas
                ref={canvasRef}
                className="sig-canvas max-w-full"
                style={{ maxHeight: '65vh', width: '100%', objectFit: 'contain' }}
                onMouseDown={mode === MODES.DRAW ? startDraw : addText}
                onMouseMove={doDraw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={mode === MODES.DRAW ? startDraw : addText}
                onTouchMove={doDraw}
                onTouchEnd={stopDraw}
              />
            </div>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}