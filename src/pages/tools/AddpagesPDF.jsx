import { useState, useRef } from 'react';
import { FilePlus, Download, Loader2, CheckCircle, Plus, Trash2, GripVertical, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages, formatFileSize } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

const PAGE_SIZES = {
  A4: [595, 842],
  Letter: [612, 792],
  A3: [842, 1191],
  A5: [420, 595],
};

export default function AddPages() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [insertions, setInsertions] = useState([]); // { afterPage: number, type: 'blank'|'image', imageData?: string, pageSize: string, color: string }
  const [pageSize, setPageSize] = useState('A4');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [insertAfter, setInsertAfter] = useState(0);
  const [insertType, setInsertType] = useState('blank');
  const [imageData, setImageData] = useState(null);
  const imageRef = useRef();

  const handleFile = async (f) => {
    setFile(f);
    setDone(false);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.6);
    setPages(p);
    setInsertAfter(p.length); // default: after last page
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result);
    reader.readAsDataURL(f);
  };

  const addInsertion = () => {
    setInsertions(prev => [...prev, {
      id: Date.now(),
      afterPage: insertAfter,
      type: insertType,
      imageData: insertType === 'image' ? imageData : null,
      pageSize,
      color: bgColor,
    }]);
  };

  const removeInsertion = (id) => setInsertions(prev => prev.filter(i => i.id !== id));

  const save = async () => {
    if (!file) return;
    setSaving(true);

    const buf = await fileToArrayBuffer(file);
    const srcDoc = await PDFDocument.load(buf);
    const outDoc = await PDFDocument.create();

    const srcPageCount = srcDoc.getPageCount();
    const copiedPages = await outDoc.copyPages(srcDoc, Array.from({ length: srcPageCount }, (_, i) => i));

    // Build list: for each original page index, copy it, then insert any pages after it
    for (let i = 0; i <= srcPageCount; i++) {
      if (i < srcPageCount) {
        outDoc.addPage(copiedPages[i]);
      }

      // Insert pages that come after page i (afterPage is 1-based: 0 = before first)
      const toInsert = insertions.filter(ins => ins.afterPage === i);
      for (const ins of toInsert) {
        const [w, h] = PAGE_SIZES[ins.pageSize] || PAGE_SIZES.A4;
        const newPage = outDoc.addPage([w, h]);

        if (ins.type === 'blank') {
          // Fill background color
          const hex = ins.color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          newPage.drawRectangle({ x: 0, y: 0, width: w, height: h, color: rgb(r, g, b) });
        } else if (ins.type === 'image' && ins.imageData) {
          try {
            const imgResp = await fetch(ins.imageData);
            const imgBytes = await imgResp.arrayBuffer();
            let embImg;
            if (ins.imageData.includes('image/png')) {
              embImg = await outDoc.embedPng(imgBytes);
            } else {
              embImg = await outDoc.embedJpg(imgBytes);
            }
            const { width: iw, height: ih } = embImg.scale(1);
            const scale = Math.min(w / iw, h / ih);
            const sw = iw * scale;
            const sh = ih * scale;
            newPage.drawImage(embImg, { x: (w - sw) / 2, y: (h - sh) / 2, width: sw, height: sh });
          } catch {
            // fallback blank
          }
        }
      }
    }

    const bytes = await outDoc.save();
    downloadFile(bytes, `pages-added_${file.name}`);
    setSaving(false);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <ToolPageLayout icon={FilePlus} title="Add Pages" description="Insert blank or image pages at any position in your PDF" color="amber">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to add pages"
            file={file} onClear={() => { setFile(null); setPages([]); setDone(false); setInsertions([]); }}
          />

          {file && !loading && (
            <>
              {/* Add Page Config */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Add New Page</p>

                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Page Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['blank', 'image'].map(t => (
                      <button key={t} onClick={() => setInsertType(t)}
                        className={`py-2 rounded-xl text-sm font-medium border-2 transition-all capitalize ${insertType === t ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-600 hover:border-amber-200'}`}>
                        {t === 'blank' ? '📄 Blank' : '🖼 Image'}
                      </button>
                    ))}
                  </div>
                </div>

                {insertType === 'image' && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">Upload Image</p>
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <button onClick={() => imageRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-3 text-sm text-slate-500 hover:text-amber-600 transition-all">
                      {imageData ? <span className="text-emerald-600 font-medium">✓ Image selected</span> : <span><Image className="w-4 h-4 inline mr-1" />Click to upload image</span>}
                    </button>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Page Size</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.keys(PAGE_SIZES).map(s => (
                      <button key={s} onClick={() => setPageSize(s)}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${pageSize === s ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {insertType === 'blank' && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">Background Color</p>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-xl border border-slate-200" />
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Insert Position</p>
                  <select value={insertAfter} onChange={e => setInsertAfter(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white">
                    <option value={0}>Before page 1</option>
                    {pages.map((_, i) => (
                      <option key={i} value={i + 1}>After page {i + 1}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={addInsertion} variant="outline" className="w-full rounded-xl gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
                  <Plus className="w-4 h-4" /> Queue This Page
                </Button>
              </div>

              {/* Queued insertions */}
              {insertions.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Queued Pages ({insertions.length})</p>
                  {insertions.map((ins) => (
                    <div key={ins.id} className="flex items-center gap-2 text-sm bg-amber-50 rounded-xl p-2.5">
                      <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="flex-1 text-slate-700">
                        {ins.type === 'blank' ? '📄 Blank' : '🖼 Image'} {ins.pageSize} — {ins.afterPage === 0 ? 'Before page 1' : `After page ${ins.afterPage}`}
                      </span>
                      <button onClick={() => removeInsertion(ins.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {done && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> PDF saved with new pages!
                </div>
              )}

              <Button onClick={save} disabled={saving || insertions.length === 0}
                className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2 shadow-lg shadow-amber-500/20">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Download className="w-4 h-4" /> Save PDF ({insertions.length} page{insertions.length !== 1 ? 's' : ''} to add)</>}
              </Button>
            </>
          )}
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="Current PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}