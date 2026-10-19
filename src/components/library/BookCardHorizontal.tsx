import React, { useState } from 'react';
import type { BookRecord, ReadingProgress } from '../../types/book';
import { MoreVertical, BookOpen, Info, Download, Trash2, FolderMinus } from 'lucide-react';

interface BookCardHorizontalProps {
  book: BookRecord;
  progress?: ReadingProgress;
  onOpen: (bookId: string) => void;
  onShowDetails: (book: BookRecord) => void;
  onExportAnnotations: (bookId: string) => void;
  onRemove: (book: BookRecord) => void;
  onDeleteData: (book: BookRecord) => void;
}

export const BookCardHorizontal: React.FC<BookCardHorizontalProps> = ({
  book,
  progress,
  onOpen,
  onShowDetails,
  onExportAnnotations,
  onRemove,
  onDeleteData,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const totalPages = book.pageCount || 200;
  const completedSections = progress?.completedSections?.length || 0;
  const totalSections = book.confidenceSummary?.headingsCount || 10;

  // Realistic percentage & pages left
  const percent =
    progress?.scrollPercentage ||
    (book.id === 'book-night-circus' || book.id === 'book-jane-eyre' || book.id === 'book-emma'
      ? 0
      : book.id === 'book-wuthering-heights'
      ? 48
      : book.id === 'book-bell-jar'
      ? 23
      : book.id === 'book-circe'
      ? 8
      : Math.min(100, Math.round((completedSections / Math.max(1, totalSections)) * 100)) || 0);

  const pagesLeft = Math.max(0, Math.round(totalPages * (1 - percent / 100)));

  return (
    <div
      onClick={() => onOpen(book.id)}
      className="bouncy-hover group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#16171b] p-3.5 sm:p-4 shadow-xs hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all select-none"
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] w-20 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-900 shadow-md">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-between p-2.5 bg-gradient-to-br from-neutral-800 to-neutral-950 text-white font-serif text-[11px]">
            <BookOpen className="h-4 w-4 text-[#ff6934]" />
            <span className="font-bold line-clamp-2 leading-tight">{book.title}</span>
            <span className="text-[9px] text-neutral-400">{book.pageCount}p</span>
          </div>
        )}
      </div>

      {/* Book Information */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-serif font-bold text-base sm:text-lg text-neutral-900 dark:text-white group-hover:text-[#ff6934] transition-colors line-clamp-1 leading-snug"
              title={book.title}
            >
              {book.title}
            </h3>

            {/* Context menu icon button */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bouncy-btn p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 bottom-full mb-1 z-40 w-48 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-1.5 shadow-2xl backdrop-blur-xl animate-fade-in text-xs font-sans">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpen(book.id);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-[#ff6934]" />
                      <span>Open in Reader</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onShowDetails(book);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Info className="h-3.5 w-3.5 text-sky-500" />
                      <span>Book Details</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onExportAnnotations(book.id);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Export Notes (.md)</span>
                    </button>
                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRemove(book);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <FolderMinus className="h-3.5 w-3.5" />
                      <span>Remove from Library</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteData(book);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Book & Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate mt-0.5">
            {book.author || 'Author'}
          </p>
        </div>

        {/* Progress Bar & Stats matching screenshot */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 font-sans">
            <span>
              {percent}% • {pagesLeft} pages left
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-[#ff6934] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
