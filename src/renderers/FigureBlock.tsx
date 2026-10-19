import React, { useState } from 'react';
import type { ContentBlock } from '../types/book';
import { Image as ImageIcon, ZoomIn, X, FileText } from 'lucide-react';

interface FigureBlockProps {
  block: ContentBlock;
  onOpenPdfPage: (page: number) => void;
}

export const FigureBlock: React.FC<FigureBlockProps> = ({ block, onOpenPdfPage }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const sourcePage = block.sourcePages?.[0] || 1;

  return (
    <>
      <figure id={block.id} className="my-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 overflow-hidden shadow-lg">
        <div className="relative group rounded-xl overflow-hidden bg-neutral-950 flex flex-col items-center justify-center p-6 min-h-[180px]">
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt={block.caption || 'Extracted Diagram'}
              className="max-h-[400px] w-auto object-contain rounded-lg cursor-pointer"
              onClick={() => setIsZoomed(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-400 py-6">
              <div className="p-3 rounded-full bg-neutral-800/80">
                <ImageIcon className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-neutral-300">
                Figure / Diagram on PDF Page {sourcePage}
              </p>
              <button
                onClick={() => onOpenPdfPage(sourcePage)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                View Original Page in PDF
              </button>
            </div>
          )}

          {block.imageUrl && (
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity backdrop-blur-sm"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Caption */}
        <figcaption className="mt-3 flex items-center justify-between px-2 text-xs text-neutral-400">
          <span className="italic">{block.caption || block.text || 'Diagram referenced in text'}</span>
          <button
            onClick={() => onOpenPdfPage(sourcePage)}
            className="flex items-center gap-1 hover:text-indigo-400 transition-colors shrink-0 ml-2"
          >
            <FileText className="h-3 w-3" />
            <span>PDF p.{sourcePage}</span>
          </button>
        </figcaption>
      </figure>

      {/* Lightbox Zoom Modal */}
      {isZoomed && block.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={block.imageUrl}
              alt="Zoomed Figure"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-neutral-700"
            />
          </div>
        </div>
      )}
    </>
  );
};
