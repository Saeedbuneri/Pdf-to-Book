import React from 'react';
import type { BookRecord } from '../../types/book';
import { X, Book, HardDrive, FileText, CheckCircle2, Layers } from 'lucide-react';

interface BookDetailsModalProps {
  book: BookRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, isOpen, onClose }) => {
  if (!isOpen || !book) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Book className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white leading-tight">{book.title}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{book.author || 'Unknown Author'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                <span>Original File</span>
              </div>
              <p className="font-medium text-neutral-200 truncate">{book.originalFileName}</p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
                <span>File Size</span>
              </div>
              <p className="font-medium text-neutral-200">{formatBytes(book.fileSize)}</p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>Pages Analyzed</span>
              </div>
              <p className="font-medium text-neutral-200">
                {book.lastProcessedPage} / {book.pageCount} pages
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                <span>Status</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {book.processingStatus}
              </span>
            </div>
          </div>

          {book.confidenceSummary && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Extracted Structure Breakdown
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <div className="text-lg font-bold text-indigo-400">
                    {book.confidenceSummary.headingsCount}
                  </div>
                  <div className="text-[11px] text-neutral-400">Chapters</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <div className="text-lg font-bold text-amber-400">
                    {book.confidenceSummary.codeCount}
                  </div>
                  <div className="text-[11px] text-neutral-400">Code Snippets</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <div className="text-lg font-bold text-emerald-400">
                    {book.confidenceSummary.mathCount}
                  </div>
                  <div className="text-[11px] text-neutral-400">Formulas</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
                  <div className="text-lg font-bold text-sky-400">
                    {book.confidenceSummary.totalBlocks}
                  </div>
                  <div className="text-[11px] text-neutral-400">Total Blocks</div>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-neutral-500 space-y-1">
            <p>Added on: {new Date(book.createdAt).toLocaleDateString()}</p>
            <p>Storage status: 100% Local IndexedDB ({book.storageStatus})</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
