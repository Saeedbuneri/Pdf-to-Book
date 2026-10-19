import React from 'react';
import type { BookRecord, ReadingProgress } from '../../types/book';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface ContinueReadingHeroProps {
  book: BookRecord;
  progress?: ReadingProgress;
  sectionTitle?: string;
  onResume: (bookId: string) => void;
}

export const ContinueReadingHero: React.FC<ContinueReadingHeroProps> = ({
  book,
  progress,
  sectionTitle = 'Chapter 1',
  onResume,
}) => {
  const percent = progress?.scrollPercentage || 25;

  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-neutral-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          {/* Mini Cover */}
          <div className="relative aspect-[3/4] w-20 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-950 shadow-md border border-neutral-700/50">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-900/40 p-2 text-center text-xs font-serif text-indigo-300">
                {book.title}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Continue Reading</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-1">
              {book.title}
            </h2>
            <div className="mt-1 flex items-center gap-3 text-xs sm:text-sm text-neutral-400">
              <span className="truncate">{book.author || 'Local Book'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-300 font-medium">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{sectionTitle}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-3 max-w-sm">
              <div className="h-2 flex-1 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-neutral-300 shrink-0">{percent}% done</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={() => onResume(book.id)}
            className="group flex items-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Resume Reading</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
