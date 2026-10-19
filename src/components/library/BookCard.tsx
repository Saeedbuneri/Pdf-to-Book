import React, { useState } from 'react';
import type { BookRecord, ReadingProgress } from '../../types/book';
import { MoreVertical, BookOpen, Info, Download, Trash2, FolderMinus, Sparkles } from 'lucide-react';

interface BookCardProps {
  book: BookRecord;
  progress?: ReadingProgress;
  onOpen: (bookId: string) => void;
  onShowDetails: (book: BookRecord) => void;
  onExportAnnotations: (bookId: string) => void;
  onRemove: (book: BookRecord) => void;
  onDeleteData: (book: BookRecord) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  progress,
  onOpen,
  onShowDetails,
  onExportAnnotations,
  onRemove,
  onDeleteData,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getGenreColor = () => {
    switch (book.genre) {
      case 'programming':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'math-science':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'prose':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getGenreLabel = () => {
    switch (book.genre) {
      case 'programming':
        return 'Code & Systems';
      case 'math-science':
        return 'Math & Science';
      case 'prose':
        return 'Literature';
      default:
        return 'Book';
    }
  };

  // Calculate approximate percentage from completed sections or saved scroll
  const completedCount = progress?.completedSections?.length || 0;
  const totalSectionsEst = book.confidenceSummary?.headingsCount || 10;
  const progressPercent = Math.min(
    100,
    progress?.scrollPercentage || Math.round((completedCount / Math.max(1, totalSectionsEst)) * 100)
  );

  return (
    <div className="group relative flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:bg-neutral-900/80 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Cover Container */}
      <div
        onClick={() => onOpen(book.id)}
        className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl bg-neutral-950 shadow-inner group-hover:shadow-md transition-all"
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-between p-5 bg-gradient-to-br from-indigo-950/80 via-neutral-900 to-neutral-950 text-white">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Reader</span>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold leading-snug line-clamp-3">{book.title}</h4>
              <p className="mt-1 text-xs text-neutral-400 truncate">{book.author || 'Local Document'}</p>
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
              {book.pageCount} Pages
            </div>
          </div>
        )}

        {/* Hover Read Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
          <button className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Read Now</span>
          </button>
        </div>

        {/* Genre Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border backdrop-blur-md ${getGenreColor()}`}
          >
            {getGenreLabel()}
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onOpen(book.id)}
              className="cursor-pointer font-medium text-white hover:text-indigo-400 transition-colors line-clamp-1 leading-snug text-sm sm:text-base"
              title={book.title}
            >
              {book.title}
            </h3>

            {/* Context Menu Button */}
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-1 z-30 w-52 rounded-xl border border-neutral-700/80 bg-neutral-900 py-1.5 shadow-2xl backdrop-blur-lg animate-fade-in text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpen(book.id);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-indigo-400" />
                      <span>Open in Reader</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onShowDetails(book);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                      <Info className="h-4 w-4 text-sky-400" />
                      <span>Book Details</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onExportAnnotations(book.id);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                      <Download className="h-4 w-4 text-emerald-400" />
                      <span>Export Notes (.md)</span>
                    </button>

                    <div className="my-1 border-t border-neutral-800" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRemove(book);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-amber-400 hover:bg-neutral-800 transition-colors"
                    >
                      <FolderMinus className="h-4 w-4" />
                      <span>Remove from Library</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteData(book);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-rose-400 hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Book & Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mt-1 text-xs text-neutral-400 truncate">{book.author || 'Local Document'}</p>
        </div>

        {/* Reading Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
            <span>Progress</span>
            <span className="font-semibold text-neutral-300">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
