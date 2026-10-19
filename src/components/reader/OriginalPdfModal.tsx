import React, { useState, useEffect, useRef } from 'react';
import type { BookRecord } from '../../types/book';
import { getBookBlob } from '../../storage/book-store';
import { loadPdfDocument, renderPdfPageToCanvas } from '../../core/pdf/pdf-loader';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  Loader2,
} from 'lucide-react';
import type * as pdfjsLib from 'pdfjs-dist';

interface OriginalPdfModalProps {
  book: BookRecord;
  targetPage: number;
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalPdfModal: React.FC<OriginalPdfModalProps> = ({
  book,
  targetPage,
  isOpen,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(targetPage);
  const [scale, setScale] = useState(1.4);
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [noPdfFile, setNoPdfFile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCurrentPage(targetPage || 1);
  }, [targetPage]);

  // Load PDF document proxy if blob exists
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    async function loadDoc() {
      setLoading(true);
      setNoPdfFile(false);

      const blob = await getBookBlob(book.id);
      if (!blob) {
        setNoPdfFile(true);
        setLoading(false);
        return;
      }

      try {
        const doc = await loadPdfDocument(blob);
        if (!cancelled) {
          setPdfDoc(doc);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF blob:', err);
        setNoPdfFile(true);
        setLoading(false);
      }
    }

    loadDoc();
    return () => {
      cancelled = true;
    };
  }, [isOpen, book.id]);

  // Render canvas when page or scale changes with cancellation support
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !isOpen) return;

    setLoading(true);
    const task = renderPdfPageToCanvas(pdfDoc, currentPage, canvasRef.current, scale);

    task.promise
      .then(() => {
        setLoading(false);
      })
      .catch((err: any) => {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Canvas render error:', err);
          setLoading(false);
        }
      });

    return () => {
      task.cancel();
    };
  }, [pdfDoc, currentPage, scale, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-5 py-3 text-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-none">
                Original PDF Inspector
              </h3>
              <p className="text-xs text-neutral-400 mt-1">{book.title}</p>
            </div>
          </div>

          {/* Page & Zoom Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800 text-xs">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none text-neutral-300"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 font-medium">
                Page {currentPage} of {book.pageCount}
              </span>

              <button
                disabled={currentPage >= book.pageCount}
                onClick={() => setCurrentPage(p => Math.min(book.pageCount, p + 1))}
                className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none text-neutral-300"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom */}
            <div className="hidden sm:flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800 text-xs">
              <button
                onClick={() => setScale(s => Math.max(0.8, s - 0.2))}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-1.5 font-medium">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-2"
              title="Close PDF Inspector"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Canvas / Preview Container */}
        <div className="flex-1 overflow-auto bg-neutral-950/90 p-4 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-xs font-medium">Rendering PDF Page...</p>
            </div>
          )}

          {!loading && !noPdfFile && (
            <div className="shadow-2xl rounded-lg overflow-hidden border border-neutral-800 bg-white">
              <canvas ref={canvasRef} className="block max-w-full" />
            </div>
          )}

          {!loading && noPdfFile && (
            <div className="max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center text-neutral-300">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-white">Pre-indexed Sample Book</h4>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                This book is a pre-loaded demonstration catalog entry with structured text and KaTeX equations pre-indexed.
                When you import your own local PDF book using the library upload zone, its complete PDF file is stored locally in IndexedDB and can be examined right here page-by-page!
              </p>
              <div className="mt-4 rounded-xl bg-neutral-950 p-3 text-xs text-indigo-300 border border-neutral-800">
                Anchored to Page {currentPage} of original document
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
