import React, { useState, useEffect, useRef, useMemo } from 'react';
import type {
  BookSection,
  ContentBlock,
  ReaderSettings,
  AnnotationRecord,
  HighlightColor,
} from '../../types/book';
import { ProseBlock } from '../../renderers/ProseBlock';
import { HeadingBlock } from '../../renderers/HeadingBlock';
import { CodeBlock } from '../../renderers/CodeBlock';
import { MathBlock } from '../../renderers/MathBlock';
import { QuoteBlock } from '../../renderers/QuoteBlock';
import { TableBlock } from '../../renderers/TableBlock';
import { FigureBlock } from '../../renderers/FigureBlock';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MessageSquarePlus,
  BookOpen,
} from 'lucide-react';

interface ReadingCanvasProps {
  section: BookSection | null;
  blocks: ContentBlock[];
  settings: ReaderSettings;
  annotations: AnnotationRecord[];
  isCompleted: boolean;
  onToggleComplete: () => void;
  onPrevSection?: () => void;
  onNextSection?: () => void;
  hasPrevSection: boolean;
  hasNextSection: boolean;
  onToggleBookmark: (blockId: string) => void;
  onAddHighlight: (blockId: string, selectedText: string, color: HighlightColor) => void;
  onOpenNoteModal: (blockId: string, selectedText?: string) => void;
  onOpenPdfPage: (page: number) => void;
}

export const ReadingCanvas: React.FC<ReadingCanvasProps> = ({
  section,
  blocks,
  settings,
  annotations,
  isCompleted,
  onToggleComplete,
  onPrevSection,
  onNextSection,
  hasPrevSection,
  hasNextSection,
  onToggleBookmark,
  onAddHighlight,
  onOpenNoteModal,
  onOpenPdfPage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
    blockId: string;
  } | null>(null);

  // Monitor text selections for quick highlight / note popup
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionPopup(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2) {
        setSelectionPopup(null);
        return;
      }

      // Find closest block container
      const anchorNode = selection.anchorNode;
      const element = anchorNode?.parentElement?.closest('[id^="blk_"]') as HTMLElement | null;
      const blockId = element?.id || blocks[0]?.id;

      if (!blockId) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // FIX #6: Clamp popup position to viewport so it never clips off-screen
      const POPUP_HEIGHT = 40;
      const POPUP_WIDTH = 200;
      const rawTop = rect.top - 12;
      const rawLeft = rect.left + rect.width / 2;

      const clampedTop = Math.max(POPUP_HEIGHT + 8, rawTop);
      const clampedLeft = Math.min(
        Math.max(POPUP_WIDTH / 2 + 8, rawLeft),
        window.innerWidth - POPUP_WIDTH / 2 - 8
      );

      setSelectionPopup({
        visible: true,
        x: clampedLeft,
        y: clampedTop,
        text,
        blockId,
      });
    };

    // Dismiss popup when clicking elsewhere
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't dismiss if clicking inside the popup itself
      if (target.closest('[data-selection-popup]')) return;
      setSelectionPopup(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [blocks]);

  // Reading width container style
  const getWidthClass = () => {
    switch (settings.readingWidth) {
      case 'narrow':
        return 'max-w-2xl';
      case 'normal':
        return 'max-w-3xl';
      case 'wide':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-6xl';
      default:
        return 'max-w-3xl';
    }
  };

  // Font family style
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-book-serif';
      case 'mono':
        return 'font-book-mono';
      case 'sans':
      default:
        return 'font-book-sans';
    }
  };

  // Memoize annotations by block ID for O(1) rendering lookup instead of O(N) array filter
  const annotationsByBlock = useMemo(() => {
    const map = new Map<string, AnnotationRecord[]>();
    for (const a of annotations) {
      const list = map.get(a.blockId);
      if (list) {
        list.push(a);
      } else {
        map.set(a.blockId, [a]);
      }
    }
    return map;
  }, [annotations]);

  // Render appropriate block renderer
  const renderBlock = (block: ContentBlock) => {
    const blockAnnotations: AnnotationRecord[] = annotationsByBlock.get(block.id) || [];
    const isBookmarked = blockAnnotations.some((a: AnnotationRecord) => a.type === 'bookmark');

    switch (block.type) {
      case 'heading':
        return (
          <HeadingBlock
            key={block.id}
            block={block}
            onOpenPdfPage={onOpenPdfPage}
          />
        );
      case 'code':
        return (
          <CodeBlock
            key={block.id}
            block={block}
            onOpenPdfPage={onOpenPdfPage}
          />
        );
      case 'math':
        return (
          <MathBlock
            key={block.id}
            block={block}
            onOpenPdfPage={onOpenPdfPage}
          />
        );
      case 'quote':
      case 'callout':
        return (
          <QuoteBlock
            key={block.id}
            block={block}
            onOpenPdfPage={onOpenPdfPage}
          />
        );
      case 'table':
        return (
          <TableBlock
            key={block.id}
            block={block}
            onOpenPdfPage={onOpenPdfPage}
          />
        );
      case 'figure':
        return (
          <FigureBlock
            key={block.id}
            block={block}
            onOpenPdfPage={onOpenPdfPage}
          />
        );
      case 'paragraph':
      default:
        return (
          <ProseBlock
            key={block.id}
            block={block}
            annotations={blockAnnotations}
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
            onOpenNote={onOpenNoteModal}
            onOpenPdfPage={onOpenPdfPage}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
          />
        );
    }
  };

  if (!section) {
    return (
      <main className="flex-1 overflow-y-auto p-12 flex items-center justify-center text-center">
        <div className="space-y-3 opacity-60">
          <BookOpen className="h-10 w-10 mx-auto" />
          <p>Select a chapter from the outline on the left to start reading.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 transition-colors select-text"
      style={{
        backgroundColor: 'var(--reader-bg)',
        color: 'var(--reader-text)',
      }}
    >
      <div className={`mx-auto ${getWidthClass()} ${getFontFamilyClass()}`}>
        {/* Section Header */}
        <header className="mb-8 pb-4 border-b" style={{ borderColor: 'var(--reader-border)' }}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
            <span>Section {section.order} • Pages {section.pageStart}-{section.pageEnd}</span>
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isCompleted ? 'Completed' : 'Mark as Done'}</span>
            </button>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
            style={{ color: 'var(--reader-heading)' }}
          >
            {section.title}
          </h1>
        </header>

        {/* Content Blocks */}
        <div className="space-y-3">
          {blocks
            .filter((b, idx) => {
              if (
                idx === 0 &&
                b.type === 'heading' &&
                b.text?.trim().toLowerCase() === section.title.trim().toLowerCase()
              ) {
                return false;
              }
              return true;
            })
            .map(b => renderBlock(b))}
        </div>

        {/* Footer Navigation (Previous / Next Topic) */}
        <footer
          className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--reader-border)' }}
        >
          {hasPrevSection ? (
            <button
              onClick={onPrevSection}
              className="bouncy-btn flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Topic</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onToggleComplete}
            className={`bouncy-btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-[#ff6934] hover:bg-[#ff551b] text-white shadow-[#ff6934]/25'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Completed' : 'Finish & Mark Done'}</span>
          </button>

          {hasNextSection ? (
            <button
              onClick={onNextSection}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>Next Topic</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div />
          )}
        </footer>
      </div>

      {/* FIX #6: Floating Selection Popup — now viewport-clamped, with data attr for dismiss detection */}
      {selectionPopup && (
        <div
          data-selection-popup
          style={{
            position: 'fixed',
            left: `${selectionPopup.x}px`,
            top: `${selectionPopup.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 flex items-center gap-1.5 rounded-full bg-neutral-900/95 px-3 py-1.5 text-white shadow-2xl backdrop-blur-md border border-neutral-700 animate-fade-in text-xs"
        >
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-700">
            {(['yellow', 'green', 'blue', 'purple', 'pink'] as HighlightColor[]).map(c => {
              const bg: Record<string, string> = {
                yellow: 'bg-amber-400',
                green: 'bg-emerald-400',
                blue: 'bg-sky-400',
                purple: 'bg-purple-400',
                pink: 'bg-rose-400',
              };
              return (
                <button
                  key={c}
                  onClick={() => {
                    onAddHighlight(selectionPopup.blockId, selectionPopup.text, c);
                    window.getSelection()?.removeAllRanges();
                    setSelectionPopup(null);
                  }}
                  className={`h-4 w-4 rounded-full ${bg[c]} hover:scale-125 transition-transform`}
                  title={`Highlight in ${c}`}
                />
              );
            })}
          </div>

          <button
            onClick={() => {
              onOpenNoteModal(selectionPopup.blockId, selectionPopup.text);
              window.getSelection()?.removeAllRanges();
              setSelectionPopup(null);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 text-indigo-400" />
            <span>Note</span>
          </button>
        </div>
      )}
    </main>
  );
};
