import { useState, useEffect, useCallback } from 'react';
import type { BookRecord, ReadingProgress } from './types/book';
import { getAllBooks, saveBook, saveSections, saveBlocks, deleteBookAndData, updateBook } from './storage/book-store';
import { getProgress } from './storage/progress-store';
import { getStorageStatistics } from './storage/cleanup';
import { SAMPLE_BOOKS, SAMPLE_SECTIONS, SAMPLE_BLOCKS } from './demo/sampleBooks';
import { SidebarRail } from './components/navigation/SidebarRail';
import { LibraryView } from './components/library/LibraryView';
import { ReaderView } from './components/reader/ReaderView';
import { DataManagementView } from './components/data-management/DataManagementView';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'library' | 'reader' | 'data-management'>('library');
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [storageUsageFormatted, setStorageUsageFormatted] = useState<string>('0 MB');
  const [initializing, setInitializing] = useState(true);

  // Manage theme state (defaulting to clean paper like the reference screenshot!)
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('smart_reader_settings');
      if (saved) {
        try {
          return JSON.parse(saved).theme || 'paper';
        } catch {
          // Fallback
        }
      }
    }
    return 'paper';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'paper' ? 'dark' : theme === 'dark' ? 'sepia' : 'paper';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('smart_reader_settings');
      const settings = saved ? JSON.parse(saved) : {};
      settings.theme = nextTheme;
      window.localStorage.setItem('smart_reader_settings', JSON.stringify(settings));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Load books and seed sample books on first launch
  const refreshLibrary = useCallback(async () => {
    let existingBooks = await getAllBooks();

    // If completely empty or needing catalog update, seed demo books
    if (existingBooks.length === 0 || existingBooks.length < 5) {
      for (const sample of SAMPLE_BOOKS) {
        await saveBook(sample);
        const sections = SAMPLE_SECTIONS[sample.id] || [];
        if (sections.length > 0) {
          await saveSections(sections);
        }
        for (const sec of sections) {
          const blocks = SAMPLE_BLOCKS[sec.id] || [];
          if (blocks.length > 0) {
            await saveBlocks(blocks);
          }
        }
      }
      existingBooks = await getAllBooks();
    }

    // Update any cached book covers if needed
    await updateBook('book-night-circus', {
      coverUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80',
    }).catch(() => {});

    existingBooks = await getAllBooks();
    setBooks(existingBooks);

    // Fetch progress for all books
    const pMap: Record<string, ReadingProgress> = {};
    for (const b of existingBooks) {
      const p = await getProgress(b.id);
      if (p) pMap[b.id] = p;
    }
    setProgressMap(pMap);

    // Fetch storage stats
    const stats = await getStorageStatistics();
    setStorageUsageFormatted(formatBytes(stats.usage));
  }, []);

  useEffect(() => {
    refreshLibrary().finally(() => setInitializing(false));
  }, [refreshLibrary]);

  const handleOpenBook = async (bookId: string) => {
    setActiveBookId(bookId);
    await updateBook(bookId, { lastOpenedAt: Date.now() });
    setCurrentView('reader');
    refreshLibrary().catch(() => {});
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteBookAndData(bookId);
    if (activeBookId === bookId) {
      setActiveBookId(null);
      setCurrentView('library');
    }
    await refreshLibrary();
  };

  const handleRemoveBook = async (bookId: string) => {
    await deleteBookAndData(bookId);
    await refreshLibrary();
  };

  const handleImportComplete = async (bookId: string) => {
    await refreshLibrary();
    handleOpenBook(bookId);
  };

  if (initializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f8f7f5] dark:bg-neutral-950 text-neutral-800 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6934]" />
          <p className="text-xs font-semibold tracking-wide">Opening your reading space...</p>
        </div>
      </div>
    );
  }

  const activeBook = books.find(b => b.id === activeBookId) || null;

  return (
    <div className="flex min-h-screen w-full bg-[#f8f7f5] dark:bg-[#0f1015] text-neutral-900 dark:text-neutral-100 antialiased selection:bg-[#ff6934]/25 selection:text-[#ff6934]">
      {/* Sleek Vertical Dock on Left (when in Library or Data-Management) */}
      {currentView !== 'reader' && (
        <SidebarRail
          currentView={currentView}
          onNavigate={view => setCurrentView(view)}
          hasActiveBook={!!activeBookId}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Main Views */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentView === 'library' && (
          <LibraryView
            books={books}
            progressMap={progressMap}
            storageUsageFormatted={storageUsageFormatted}
            onOpenBook={handleOpenBook}
            onDeleteBook={handleDeleteBook}
            onRemoveBook={handleRemoveBook}
            onNavigateToDataManagement={() => setCurrentView('data-management')}
            onImportComplete={handleImportComplete}
          />
        )}

        {currentView === 'reader' && activeBook && (
          <ReaderView
            book={activeBook}
            onBackToLibrary={() => {
              setCurrentView('library');
              refreshLibrary().catch(() => {});
            }}
          />
        )}

        {currentView === 'data-management' && (
          <DataManagementView
            books={books}
            onBackToLibrary={() => setCurrentView('library')}
            onRefreshLibrary={refreshLibrary}
            onDeleteBook={handleDeleteBook}
          />
        )}
      </div>
    </div>
  );
}

export default App;
