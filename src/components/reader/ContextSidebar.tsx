import React, { useState, useMemo } from 'react';
import type { BookSection, ContentBlock, AnnotationRecord } from '../../types/book';
import {
  List,
  Bookmark,
  MessageSquare,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ContextSidebarProps {
  currentSection: BookSection | null;
  blocks: ContentBlock[];
  annotations: AnnotationRecord[];
  completedCount: number;
  totalSections: number;
  onJumpToBlock: (blockId: string) => void;
  onDeleteAnnotation: (id: string) => void;
  isOpen: boolean;
}

export const ContextSidebar: React.FC<ContextSidebarProps> = ({
  currentSection,
  blocks,
  annotations,
  completedCount,
  totalSections,
  onJumpToBlock,
  onDeleteAnnotation,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'bookmarks' | 'notes' | 'stats'>('outline');

  // Extract headings from active section blocks
  const onPageHeadings = useMemo(() => blocks.filter(b => b.type === 'heading'), [blocks]);

  const bookmarks = useMemo(() => annotations.filter(a => a.type === 'bookmark'), [annotations]);
  const notes = useMemo(() => annotations.filter(a => a.type === 'note'), [annotations]);

  // Estimate reading time (~200 words per minute) for current section
  const totalWords = useMemo(() => {
    return blocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0);
  }, [blocks]);

  const minutesEst = useMemo(() => Math.max(1, Math.ceil(totalWords / 200)), [totalWords]);

  if (!isOpen) return null;

  return (
    <aside
      className="flex h-[calc(100vh-3.5rem)] w-72 sm:w-80 flex-col border-l shrink-0 overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--reader-surface)',
        borderColor: 'var(--reader-border)',
        color: 'var(--reader-text)',
      }}
    >
      {/* Tabs Header */}
      <div className="flex border-b border-inherit p-1.5 gap-1 text-xs">
        {[
          { id: 'outline', label: 'Outline', icon: List },
          { id: 'bookmarks', label: `Saves (${bookmarks.length})`, icon: Bookmark },
          { id: 'notes', label: `Notes (${notes.length})`, icon: MessageSquare },
          { id: 'stats', label: 'Stats', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`bouncy-pill flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-2 font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#ff6934] text-white shadow-md shadow-[#ff6934]/25 font-semibold'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3.5 text-xs">
        {/* Outline / In This Section */}
        {activeTab === 'outline' && (
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider opacity-60">On This Page</h4>
            {onPageHeadings.length > 0 ? (
              <div className="space-y-1">
                {onPageHeadings.map(h => (
                  <button
                    key={h.id}
                    onClick={() => onJumpToBlock(h.id)}
                    className="flex w-full items-start gap-2 rounded-lg py-1.5 px-2 text-left opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="opacity-40 mt-0.5">•</span>
                    <span className="line-clamp-2 leading-snug">{h.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No sub-headings in this section.</p>
            )}

            <div className="pt-4 border-t border-inherit">
              <div className="rounded-xl border border-inherit bg-black/5 dark:bg-white/5 p-3">
                <div className="flex items-center gap-2 font-medium opacity-80 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Section Details</span>
                </div>
                <p className="opacity-60 text-[11px]">
                  Pages: {currentSection?.pageStart || 1} - {currentSection?.pageEnd || 1}
                </p>
                <p className="opacity-60 text-[11px] mt-0.5">
                  Blocks: {blocks.length} elements
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider opacity-60">
              Saved Bookmarks ({bookmarks.length})
            </h4>
            {bookmarks.length > 0 ? (
              <div className="space-y-2">
                {bookmarks.map(bm => (
                  <div
                    key={bm.id}
                    className="group flex items-start justify-between rounded-xl border border-inherit bg-black/5 dark:bg-white/5 p-2.5 transition-all"
                  >
                    <div
                      onClick={() => onJumpToBlock(bm.blockId)}
                      className="cursor-pointer flex-1 mr-2"
                    >
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium mb-1">
                        <Bookmark className="h-3 w-3 fill-current" />
                        <span>Bookmark</span>
                      </div>
                      <p className="opacity-80 line-clamp-2 leading-relaxed text-[11px]">
                        {bm.selectedText || `Block reference: #${bm.blockId}`}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteAnnotation(bm.id)}
                      className="p-1 rounded opacity-40 hover:opacity-100 hover:text-rose-400 transition-colors"
                      title="Delete bookmark"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No bookmarks yet. Click the bookmark icon on any paragraph to save it.</p>
            )}
          </div>
        )}

        {/* Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider opacity-60">
              Personal Notes ({notes.length})
            </h4>
            {notes.length > 0 ? (
              <div className="space-y-2.5">
                {notes.map(n => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-inherit bg-black/5 dark:bg-white/5 p-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => onJumpToBlock(n.blockId)}
                        className="cursor-pointer font-medium opacity-90 leading-relaxed hover:text-indigo-400 transition-colors"
                      >
                        {n.noteText}
                      </div>
                      <button
                        onClick={() => onDeleteAnnotation(n.id)}
                        className="p-1 rounded opacity-40 hover:opacity-100 hover:text-rose-400 transition-colors shrink-0"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* FIX #5: was "{n.selectedText}" — JSX string literals, variable wasn't interpolated */}
                    {n.selectedText && (
                      <div className="border-l-2 border-indigo-500/40 pl-2 text-[11px] opacity-60 italic line-clamp-2">
                        &ldquo;{n.selectedText}&rdquo;
                      </div>
                    )}

                    <div className="text-[10px] opacity-40">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No notes created yet. Hover over any paragraph or highlight text to add a note.</p>
            )}
          </div>
        )}

        {/* Reading Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h4 className="font-semibold uppercase tracking-wider opacity-60">Reading Progress</h4>

            <div className="rounded-2xl border border-inherit bg-black/5 dark:bg-white/5 p-4 text-center">
              <div className="text-3xl font-extrabold text-indigo-400">
                {Math.round((completedCount / Math.max(1, totalSections)) * 100)}%
              </div>
              <div className="text-xs opacity-70 mt-1">Book Completion</div>

              <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                  style={{
                    width: `${Math.round((completedCount / Math.max(1, totalSections)) * 100)}%`,
                  }}
                />
              </div>

              <div className="mt-2 text-[11px] opacity-60">
                {completedCount} of {totalSections} sections completed
              </div>
            </div>

            <div className="space-y-2">
              {/* FIX #13: Label is now explicit that this is section-level, not book-wide */}
              <div className="flex items-center justify-between rounded-xl border border-inherit p-3">
                <span className="opacity-70">Est. Time (this section)</span>
                <span className="font-semibold">{minutesEst} min read</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-inherit p-3">
                <span className="opacity-70">Words (this section)</span>
                <span className="font-semibold">{totalWords.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
