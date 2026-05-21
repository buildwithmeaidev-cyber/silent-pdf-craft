import { useState, useRef } from 'react';
import { Image, Download, Loader2, X, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import { downloadFile } from '@/utils/pdfUtils';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const PAGE_SIZES = {
  'A4': [595.28, 841.89],
  'Letter': [612, 792],
  'A3': [841.89, 1190.55],
  'Square': [595, 595],
};

export default function PhotoToPdf() {
  const inputRef = useRef();
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('A4');
  const [fit, setFit] = useState('contain');
  const [saving, setSaving] = useState(false);
  const [outputName, setOutputName] = useState('photos');

  const addImages = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, { id: `img-${Date.now()}-${Math.random()}`, file, url, name: file.name }]);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addImages(e.dataTransfer.files);
  };

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setImages(items);
  };

  const convert = async () => {
    if (!images.length) return;
    setSaving(true);
    const pdfDoc = await PDFDocument.create();
    const [pgW, pgH] = PAGE_SIZES[pageSize];

    for (const imgData of images) {
      const arrayBuf = await imgData.file.arrayBuffer();
      const mimeType = imgData.file.type;
      let embeddedImg;
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        embeddedImg = await pdfDoc.embedJpg(arrayBuf);
      } else {
        // Convert to PNG via canvas
        const canvas = document.createElement('canvas');
        const img = new window.Image();
        await new Promise(r => { img.onload = r; img.src = imgData.url; });
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        const pngBuf = await pngBlob.arrayBuffer();
        embeddedImg = await pdfDoc.embedPng(pngBuf);
      }

      const page = pdfDoc.addPage([pgW, pgH]);
      const { width: iW, height: iH } = embeddedImg;
      let x = 0, y = 0, drawW = pgW, drawH = pgH;

      if (fit === 'contain') {
        const scale = Math.min(pgW / iW, pgH / iH);
        drawW = iW * scale;
        drawH = iH * scale;
        x = (pgW - drawW) / 2;
        y = (pgH - drawH) / 2;
      } else if (fit === 'fill') {
        drawW = pgW; drawH = pgH;
      }

      page.drawImage(embeddedImg, { x, y, width: drawW, height: drawH });
    }

    const bytes = await pdfDoc.save();
    downloadFile(bytes, `${outputName || 'photos'}.pdf`);
    setSaving(false);
  };

  return (
    <ToolPageLayout icon={Image} title="Photo to PDF" description="Convert images to a PDF document in seconds" color="amber">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Image Area */}
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer hover:bg-amber-50/50 transition-all"
          >
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => addImages(e.target.files)} />
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-7 h-7 text-amber-600" />
            </div>
            <p className="font-semibold text-slate-700">Add Images</p>
            <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP, GIF supported</p>
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-2xl"
                  >
                    <AnimatePresence>
                      {images.map((img, index) => (
                        <Draggable key={img.id} draggableId={img.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative group w-28 ${snapshot.isDragging ? 'rotate-2 shadow-xl z-50' : ''}`}
                              style={provided.draggableProps.style}
                            >
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div {...provided.dragHandleProps}
                                  className="flex justify-center p-1.5 bg-slate-50 cursor-grab"
                                >
                                  <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                                </div>
                                <img src={img.url} alt={img.name} className="w-full h-20 object-cover" />
                                <p className="p-1.5 text-xs text-center text-slate-500 truncate">{img.name}</p>
                              </div>
                              <button
                                onClick={() => removeImage(img.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="font-semibold text-slate-800">Settings</p>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Output Filename</label>
              <input
                type="text"
                value={outputName}
                onChange={e => setOutputName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="filename"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Page Size</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(PAGE_SIZES).map(s => (
                  <button key={s} onClick={() => setPageSize(s)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${pageSize === s ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-amber-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Image Fit</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'contain', label: 'Contain' }, { id: 'fill', label: 'Fill Page' }].map(o => (
                  <button key={o.id} onClick={() => setFit(o.id)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${fit === o.id ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-amber-50'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
            <p className="font-semibold mb-1">{images.length} image{images.length !== 1 ? 's' : ''} selected</p>
            <p className="text-xs">Each image will become one page in the PDF</p>
          </div>

          <Button
            onClick={convert}
            disabled={!images.length || saving}
            className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2 shadow-lg shadow-amber-500/20"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</> : <><Download className="w-4 h-4" /> Convert to PDF</>}
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}