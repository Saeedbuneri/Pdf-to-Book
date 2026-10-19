import React, { useState, useMemo } from 'react';
import type { BookRecord, ReadingProgress } from '../../types/book';
import { BookCardHorizontal } from './BookCardHorizontal';
import { ContinueReadingCarousel } from './ContinueReadingCarousel';
import { ImportZone } from './ImportZone';
import { BookDetailsModal } from '../dialogs/BookDetailsModal';
import { ConfirmDialog } from '../dialogs/ConfirmDialog';
import { exportBookAnnotationsMarkdown } from '../../storage/backup';
import {
  Search,
  Filter,
  SlidersHorizontal,
  HardDrive,
  Plus,
} from 'lucide-react';

interface LibraryViewProps {
  books: BookRecord[];
  progressMap: Record<string, ReadingProgress>;
  storageUsageFormatted: string;
  onOpenBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => Promise<void>;
  onRemoveBook: (bookId: string) => Promise<void>;
  onNavigateToDataManagement: () => void;
  onImportComplete: (bookId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  progressMap,
  storageUsageFormatted,
  onOpenBook,
  onDeleteBook,
  onRemoveBook,
  onNavigateToDataManagement,
  onImportComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPill, setSelectedPill] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'created' | 'title'>('recent');
  const [showImportArea, setShowImportArea] = useState(false);

  const [detailsModalBook, setDetailsModalBook] = useState<BookRecord | null>(null);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState<BookRecord | null>(null);
  const [confirmRemoveBook, setConfirmRemoveBook] = useState<BookRecord | null>(null);

  // Filter pills matching the reference screenshot!
  const filterPills = [
    { id: 'All', label: 'All' },
    { id: 'Novel', label: 'Novel' },
    { id: 'Fiction', label: 'Fiction' },
    { id: 'Science fiction', label: 'Science fiction' },
    { id: 'Code & Architecture', label: 'Code & Systems' },
    { id: 'Math & Science', label: 'Math & Science' },
    { id: 'Fantasy', label: 'Fantasy' },
    { id: 'Mystery', label: 'Mystery' },
    { id: 'Thriller', label: 'Thriller' },
    { id: 'Horror', label: 'Horror' },
  ];

  // Filter books based on search and selected pill
  const filteredBooks = useMemo(() => {
    return books
      .filter(b => {
        const matchesQuery =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesQuery) return false;

        if (selectedPill === 'All') return true;
        if (selectedPill === 'Fiction' || selectedPill === 'Novel') {
          return b.genre === 'prose' || b.genre === 'general';
        }
        if (selectedPill === 'Code & Architecture') {
          return b.genre === 'programming';
        }
        if (selectedPill === 'Math & Science') {
          return b.genre === 'math-science';
        }
        // Fallback: show prose books for fictional genres
        return b.genre === 'prose';
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0);
        }
        if (sortBy === 'created') {
          return b.createdAt - a.createdAt;
        }
        return a.title.localeCompare(b.title);
      });
  }, [books, searchQuery, selectedPill, sortBy]);

  const handleExportAnnotations = async (bookId: string) => {
    const md = await exportBookAnnotationsMarkdown(bookId);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_${bookId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8f7f5] dark:bg-[#0f1015] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-[#0f1015]/80 px-6 sm:px-10 py-4 backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search books, authors, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/70 py-2 pl-10 pr-4 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-[#ff6934] focus:outline-none focus:ring-2 focus:ring-[#ff6934]/20 transition-all"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="bouncy-btn flex items-center gap-1.5 rounded-xl bg-[#ff6934] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#ff6934]/25 hover:bg-[#ff551b] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Import PDF</span>
          </button>

          <button
            onClick={onNavigateToDataManagement}
            className="bouncy-btn flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs"
            title="Local Storage and Data Management"
          >
            <HardDrive className="h-3.5 w-3.5 text-[#ff6934]" />
            <span className="hidden sm:inline font-semibold">{storageUsageFormatted}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 sm:px-10 py-8">
        {/* Continue reading Carousel Hero Card */}
        <ContinueReadingCarousel
          books={books}
          progressMap={progressMap}
          onOpenBook={onOpenBook}
        />

        {/* PDF Import Area (Collapsible / Toggleable) */}
        {showImportArea && (
          <div className="mb-8 animate-fade-in">
            <ImportZone
              onImportComplete={bookId => {
                setShowImportArea(false);
                onImportComplete(bookId);
              }}
              onStartReadingImmediately={onOpenBook}
            />
          </div>
        )}

        {/* Library Section Title & Filter Pills */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
              Library
            </h2>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recently read</option>
                  <option value="created">Date added</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedPill('All')}
                className="bouncy-btn p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Filter options"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bouncy Pill Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {filterPills.map(pill => {
              const isSelected = selectedPill === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedPill(pill.id)}
                  className={`bouncy-pill rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#ff6934] text-white shadow-md shadow-[#ff6934]/30 scale-105 font-semibold'
                      : 'bg-neutral-200/60 dark:bg-neutral-800/70 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal Book Cards Grid (3 Columns on Desktop matching screenshot!) */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map(book => (
              <BookCardHorizontal
                key={book.id}
                book={book}
                progress={progressMap[book.id]}
                onOpen={onOpenBook}
                onShowDetails={b => setDetailsModalBook(b)}
                onExportAnnotations={handleExportAnnotations}
                onRemove={b => setConfirmRemoveBook(b)}
                onDeleteData={b => setConfirmDeleteBook(b)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center my-6">
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
              No books found in this category
            </h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-sm">
              Click "All" or import a PDF book to add to your library.
            </p>
            <button
              onClick={() => setSelectedPill('All')}
              className="bouncy-btn mt-4 rounded-xl bg-[#ff6934] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#ff6934]/20"
            >
              Show All Books
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <BookDetailsModal
        book={detailsModalBook}
        isOpen={!!detailsModalBook}
        onClose={() => setDetailsModalBook(null)}
      />

      {/* Remove from Library Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmRemoveBook}
        title="Remove from Library?"
        message={`Are you sure you want to remove "${confirmRemoveBook?.title}" from your library list?`}
        confirmText="Remove"
        onConfirm={async () => {
          if (confirmRemoveBook) {
            await onRemoveBook(confirmRemoveBook.id);
            setConfirmRemoveBook(null);
          }
        }}
        onCancel={() => setConfirmRemoveBook(null)}
      />

      {/* Delete Book & Local Data Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDeleteBook}
        title="Permanently Delete Book & Data?"
        message={`This will permanently delete "${confirmDeleteBook?.title}", its stored PDF file, extracted text, reading progress, bookmarks, and all personal notes from your computer's local IndexedDB.`}
        confirmText="Permanently Delete"
        isDestructive={true}
        onConfirm={async () => {
          if (confirmDeleteBook) {
            await onDeleteBook(confirmDeleteBook.id);
            setConfirmDeleteBook(null);
          }
        }}
        onCancel={() => setConfirmDeleteBook(null)}
      />
    </div>
  );
};
