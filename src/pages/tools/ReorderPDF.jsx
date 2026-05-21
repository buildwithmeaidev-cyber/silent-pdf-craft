import { useState } from 'react';
import { ArrowUpDown, Download, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fileToArrayBuffer, downloadFile, loadPdfThumbnails } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';

export default function ReorderPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [saving, setSaving] = useState(false);
  const originalOrderRef = { current: [] };

  const handleFile = async (f) => {
    setFile(f);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { thumbs } = await loadPdfThumbnails(buf, 0.4);
    const ordered = thumbs.map((t, i) => ({ ...t, id: `page-${i}`, originalIndex: i }));
    setPages(ordered);
    originalOrderRef.current = ordered;
    setLoading(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setPages(items);
  };

  const removePage = (id) => setPages(p => p.filter(pg => pg.id !== id));

  const resetOrder = () => setPages(p => [...p].sort((a, b) => a.originalIndex - b.originalIndex));

  const exportPdf = async () => {
    setSaving(true);
    const buf = await fileToArrayBuffer(file);
    const srcDoc = await PDFDocument.load(buf);
    const newDoc = await PDFDocument.create();
    for (const pg of pages) {
      const [copied] = await newDoc.copyPages(srcDoc, [pg.originalIndex]);
      newDoc.addPage(copied);
    }
    const bytes = await newDoc.save();
    downloadFile(bytes, `reordered_${file.name}`);
    setSaving(false);
  };

  return (
    <ToolPageLayout icon={ArrowUpDown} title="Reorder Pages" description="Drag and drop to rearrange your PDF pages" color="violet">
      {!file ? (
        <FileUploadZone onFile={handleFile} accept=".pdf" label="Drop your PDF to reorder pages" />
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FileUploadZone file={file} onClear={() => { setFile(null); setPages([]); }} />
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={resetOrder} className="rounded-xl gap-2">
                <RotateCcw className="w-4 h-4" /> Reset Order
              </Button>
              <Button onClick={exportPdf} disabled={saving || pages.length === 0} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Save PDF ({pages.length} pages)
              </Button>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 text-sm text-violet-700 flex items-center gap-2">
            <GripVertical className="w-4 h-4 flex-shrink-0" />
            Drag the page cards to rearrange order. Click the trash icon to remove pages.
          </div>

          {/* Page Grid */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pages" direction="horizontal">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl min-h-[200px]"
                >
                  <AnimatePresence>
                    {pages.map((pg, index) => (
                      <Draggable key={pg.id} draggableId={pg.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group flex-shrink-0 ${snapshot.isDragging ? 'z-50 rotate-2 shadow-2xl' : ''}`}
                            style={provided.draggableProps.style}
                          >
                            <div className="w-32 bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-violet-300 transition-all">
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps}
                                className="flex items-center justify-center p-2 bg-slate-50 border-b border-slate-100 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>
                              <img src={pg.dataUrl} alt={`Page ${pg.pageNum}`} className="w-full" />
                              {/* Page Number */}
                              <div className="p-2 text-center">
                                <span className="text-xs font-semibold text-slate-600">Page {index + 1}</span>
                                <span className="text-xs text-slate-400 block">orig: {pg.originalIndex + 1}</span>
                              </div>
                            </div>
                            {/* Delete Button */}
                            <button
                              onClick={() => removePage(pg.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                  {pages.length === 0 && (
                    <div className="w-full flex items-center justify-center py-12 text-slate-400 text-sm">
                      All pages removed. Click Reset Order to restore.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </ToolPageLayout>
  );
}