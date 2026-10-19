import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  BookRecord,
  BookSection,
  ContentBlock,
  ReaderSettings,
  AnnotationRecord,
  HighlightColor,
} from '../../types/book';
import { ReaderNavbar } from './ReaderNavbar';
import { StructureSidebar } from './StructureSidebar';
import { ReadingCanvas } from './ReadingCanvas';
import { ContextSidebar } from './ContextSidebar';
import { OriginalPdfModal } from './OriginalPdfModal';
import { SearchModal } from './SearchModal';
import { NoteModal } from './NoteModal';
import {
  getSectionsForBook,
  getBlocksForSection,
} from '../../storage/book-store';
import {
  getProgress,
  saveProgress,
  markSectionCompleted,
} from '../../storage/progress-store';
import {
  getAnnotationsForBook,
  toggleBookmark,
  addHighlight,
  addNote,
  deleteAnnotation,
} from '../../storage/annotation-store';
import { SAMPLE_SECTIONS, SAMPLE_BLOCKS } from '../../demo/sampleBooks';

interface ReaderViewProps {
  book: BookRecord;
  onBackToLibrary: () => void;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'dark',
  fontFamily: 'sans',
  fontSize: 18,
  lineHeight: 1.75,
  readingWidth: 'normal',
  navigationMode: 'topic',
  focusMode: false,
  showStructureSidebar: true,
  showContextSidebar: true,
};

export const ReaderView: React.FC<ReaderViewProps> = ({ book, onBackToLibrary }) => {
  // Load settings from localStorage
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('smart_reader_settings');
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // Fallback
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [sections, setSections] = useState<BookSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationRecord[]>([]);
  const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);

  // Modals & Tools
  const [searchOpen, setSearchOpen] = useState(false);
  const [originalPdfOpen, setOriginalPdfOpen] = useState(false);
  const [targetPdfPage, setTargetPdfPage] = useState<number>(1);
  const [noteModalConfig, setNoteModalConfig] = useState<{
    isOpen: boolean;
    blockId: string;
    selectedText?: string;
  }>({ isOpen: false, blockId: '' });

  // Stable settings updater
  const handleUpdateSettings = useCallback((updates: Partial<ReaderSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('smart_reader_settings', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Set document data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Load sections and initial progress
  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      let bookSections = await getSectionsForBook(book.id);

      if (bookSections.length === 0 && SAMPLE_SECTIONS[book.id]) {
        bookSections = SAMPLE_SECTIONS[book.id];
      }

      if (!active) return;
      setSections(bookSections);

      const progress = await getProgress(book.id);
      const savedSectionId = progress?.sectionId;
      const initialSectionId =
        savedSectionId && bookSections.some(s => s.id === savedSectionId)
          ? savedSectionId
          : bookSections[0]?.id || '';

      setActiveSectionId(initialSectionId);
      setCompletedSectionIds(progress?.completedSections || []);

      const bookAnnotations = await getAnnotationsForBook(book.id);
      if (active) {
        setAnnotations(bookAnnotations);
      }
    }

    loadInitialData();
    return () => {
      active = false;
    };
  }, [book.id]);

  // Load blocks whenever activeSectionId changes.
  // FIX #1: completedSectionIds removed from deps — it was causing stale-closure progress saves.
  // Progress is now saved only in handleToggleComplete where the value is fresh.
  useEffect(() => {
    if (!activeSectionId) return;

    let active = true;
    async function loadBlocks() {
      let sectionBlocks = await getBlocksForSection(activeSectionId);

      if (sectionBlocks.length === 0 && SAMPLE_BLOCKS[activeSectionId]) {
        sectionBlocks = SAMPLE_BLOCKS[activeSectionId];
      }

      if (active) {
        setBlocks(sectionBlocks);
      }
    }

    loadBlocks();
    return () => {
      active = false;
    };
  }, [activeSectionId]);

  // Find active section object
  const currentSection = useMemo(() => {
    return sections.find(s => s.id === activeSectionId) || null;
  }, [sections, activeSectionId]);

  // Section navigation helpers
  const currentIndex = useMemo(
    () => sections.findIndex(s => s.id === activeSectionId),
    [sections, activeSectionId]
  );
  const hasPrevSection = currentIndex > 0;
  const hasNextSection = currentIndex < sections.length - 1;

  // FIX #11: All navigation/action handlers wrapped in useCallback for stable references
  const goToPrevSection = useCallback(() => {
    setActiveSectionId(prev => {
      const idx = sections.findIndex(s => s.id === prev);
      return idx > 0 ? sections[idx - 1].id : prev;
    });
  }, [sections]);

  const goToNextSection = useCallback(() => {
    setActiveSectionId(prev => {
      const idx = sections.findIndex(s => s.id === prev);
      return idx < sections.length - 1 ? sections[idx + 1].id : prev;
    });
  }, [sections]);

  // FIX #1 continued: Toggle complete now also persists progress with correct values
  const handleToggleComplete = useCallback(async () => {
    if (!activeSectionId) return;

    setCompletedSectionIds(prev => {
      const isDone = prev.includes(activeSectionId);
      const next = isDone
        ? prev.filter(id => id !== activeSectionId)
        : [...prev, activeSectionId];

      // Persist with fresh state inside the setter to avoid stale closure
      markSectionCompleted(book.id, activeSectionId).catch(() => {});
      saveProgress({
        bookId: book.id,
        sectionId: activeSectionId,
        completedSections: next,
        updatedAt: Date.now(),
      }).catch(() => {});

      return next;
    });
  }, [activeSectionId, book.id]);

  // FIX #17: Optimistic annotation updates — no full DB re-fetch on every mutation
  const handleToggleBookmark = useCallback(async (blockId: string) => {
    const wasAdded = await toggleBookmark(book.id, activeSectionId, blockId);
    setAnnotations(prev => {
      if (!wasAdded) {
        // Remove bookmark from local state
        return prev.filter(a => !(a.type === 'bookmark' && a.blockId === blockId));
      } else {
        // Add bookmark optimistically
        const newBm: AnnotationRecord = {
          id: 'bm_' + Math.random().toString(36).substring(2, 9),
          bookId: book.id,
          sectionId: activeSectionId,
          blockId,
          type: 'bookmark',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return [...prev, newBm];
      }
    });
  }, [book.id, activeSectionId]);

  const handleAddHighlight = useCallback(async (blockId: string, selectedText: string, color: HighlightColor) => {
    const record = await addHighlight(book.id, activeSectionId, blockId, selectedText, color);
    // Optimistically append — the returned record is the persisted one
    setAnnotations(prev => [...prev, record]);
  }, [book.id, activeSectionId]);

  const handleOpenNoteModal = useCallback((blockId: string, selectedText?: string) => {
    setNoteModalConfig({ isOpen: true, blockId, selectedText });
  }, []);

  const handleSaveNote = useCallback(async (blockId: string, noteText: string, selectedText?: string) => {
    const record = await addNote(book.id, activeSectionId, blockId, noteText, selectedText);
    setAnnotations(prev => [...prev, record]);
  }, [book.id, activeSectionId]);

  const handleDeleteAnnotation = useCallback(async (id: string) => {
    await deleteAnnotation(id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleJumpToBlock = useCallback((blockId: string) => {
    const el = document.getElementById(blockId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-indigo-500', 'rounded-lg');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-500');
      }, 1800);
    }
  }, []);

  const handleOpenPdfPage = useCallback((page: number) => {
    setTargetPdfPage(page);
    setOriginalPdfOpen(true);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowLeft') {
        goToPrevSection();
      } else if (e.key === 'ArrowRight') {
        goToNextSection();
      } else if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevSection, goToNextSection]);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden transition-colors"
      data-theme={settings.theme}
      style={{
        backgroundColor: 'var(--reader-bg)',
        color: 'var(--reader-text)',
      }}
    >
      {/* Top Reading Navbar */}
      <ReaderNavbar
        book={book}
        currentSection={currentSection}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onBackToLibrary={onBackToLibrary}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleOriginalPdf={() => handleOpenPdfPage(currentSection?.pageStart || 1)}
      />

      {/* Three-Panel Desktop Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Table of Contents & Structure */}
        <StructureSidebar
          sections={sections}
          activeSectionId={activeSectionId}
          completedSectionIds={completedSectionIds}
          onSelectSection={setActiveSectionId}
          isOpen={settings.showStructureSidebar && !settings.focusMode}
        />

        {/* Center Panel: Reading Canvas */}
        <ReadingCanvas
          section={currentSection}
          blocks={blocks}
          settings={settings}
          annotations={annotations}
          isCompleted={completedSectionIds.includes(activeSectionId)}
          onToggleComplete={handleToggleComplete}
          onPrevSection={goToPrevSection}
          onNextSection={goToNextSection}
          hasPrevSection={hasPrevSection}
          hasNextSection={hasNextSection}
          onToggleBookmark={handleToggleBookmark}
          onAddHighlight={handleAddHighlight}
          onOpenNoteModal={handleOpenNoteModal}
          onOpenPdfPage={handleOpenPdfPage}
        />

        {/* Right Panel: Context Tools (Notes, Bookmarks, Page Outline) */}
        <ContextSidebar
          currentSection={currentSection}
          blocks={blocks}
          annotations={annotations}
          completedCount={completedSectionIds.length}
          totalSections={sections.length}
          onJumpToBlock={handleJumpToBlock}
          onDeleteAnnotation={handleDeleteAnnotation}
          isOpen={settings.showContextSidebar && !settings.focusMode}
        />
      </div>

      {/* In-Book Instant Search Modal */}
      <SearchModal
        bookId={book.id}
        sections={sections}
        blocks={blocks}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={(sectionId, blockId) => {
          setActiveSectionId(sectionId);
          setTimeout(() => handleJumpToBlock(blockId), 150);
        }}
      />

      {/* Original PDF Page Inspector */}
      <OriginalPdfModal
        book={book}
        targetPage={targetPdfPage}
        isOpen={originalPdfOpen}
        onClose={() => setOriginalPdfOpen(false)}
      />

      {/* Note Creation / Editing Modal */}
      <NoteModal
        isOpen={noteModalConfig.isOpen}
        blockId={noteModalConfig.blockId}
        selectedText={noteModalConfig.selectedText}
        onSave={handleSaveNote}
        onClose={() => setNoteModalConfig({ isOpen: false, blockId: '' })}
      />
    </div>
  );
};
