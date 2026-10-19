import React, { useRef } from 'react';
import type { BookRecord, ReadingProgress } from '../../types/book';
import { ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';

interface ContinueReadingCarouselProps {
  books: BookRecord[];
  progressMap: Record<string, ReadingProgress>;
  onOpenBook: (bookId: string) => void;
}

export const ContinueReadingCarousel: React.FC<ContinueReadingCarouselProps> = ({
  books,
  progressMap,
  onOpenBook,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Take the top active books
  const activeBooks = books.slice(0, 5);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  if (activeBooks.length === 0) return null;

  return (
    <div className="relative mb-8 rounded-[28px] bg-[#16171b] p-6 sm:p-7 text-white shadow-2xl overflow-hidden border border-neutral-800/60">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Continue reading
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#ff6934]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6934]">
            <Sparkles className="h-3 w-3" />
            <span>Active Shelf</span>
          </span>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="bouncy-btn flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-800/80 text-neutral-300 hover:border-neutral-500 hover:text-white transition-all shadow-sm"
            title="Scroll Left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollRight}
            className="bouncy-btn flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-800/80 text-neutral-300 hover:border-[#ff6934] hover:text-[#ff6934] transition-all shadow-sm"
            title="Scroll Right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Row */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeBooks.map(book => {
          const prog = progressMap[book.id];
          const totalPages = book.pageCount || 200;
          const completedSections = prog?.completedSections?.length || 0;
          const totalSections = book.confidenceSummary?.headingsCount || 10;
          
          // Compute realistic pages left & percentage truthfully from user reading data
          const percent =
            prog?.scrollPercentage !== undefined
              ? Math.round(prog.scrollPercentage)
              : Math.min(100, Math.round((completedSections / Math.max(1, totalSections)) * 100));

          const pagesLeft = Math.max(
            0,
            Math.round(totalPages * (1 - percent / 100))
          );

          return (
            <div
              key={book.id}
              onClick={() => onOpenBook(book.id)}
              className="group flex min-w-[280px] sm:min-w-[320px] max-w-[340px] cursor-pointer items-center gap-4 rounded-2xl bg-neutral-900/60 p-3.5 border border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-850 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              {/* Book Cover */}
              <div className="relative aspect-[2/3] w-18 sm:w-20 shrink-0 overflow-hidden rounded-xl shadow-lg border border-neutral-700/40 bg-neutral-950">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col justify-center items-center bg-gradient-to-br from-neutral-800 to-neutral-900 p-2 text-center text-[10px] text-neutral-300 font-serif">
                    <BookOpen className="h-5 w-5 mb-1 text-[#ff6934]" />
                    <span className="line-clamp-2">{book.title}</span>
                  </div>
                )}
              </div>

              {/* Details & Progress */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <h3
                    className="font-serif font-bold text-base text-white group-hover:text-[#ff6934] transition-colors line-clamp-1 leading-snug"
                    title={book.title}
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {book.author || 'Author'}
                  </p>
                </div>

                {/* Progress bar and stats */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium mb-1.5">
                    <span>
                      {percent}% • {pagesLeft} pages left
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-[#ff6934] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
