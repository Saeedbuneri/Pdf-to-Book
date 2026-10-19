import React from 'react';
import type { ContentBlock, AnnotationRecord } from '../types/book';
import { Bookmark, MessageSquarePlus, FileText } from 'lucide-react';

interface ProseBlockProps {
  block: ContentBlock;
  annotations: AnnotationRecord[];
  isBookmarked: boolean;
  onToggleBookmark: (blockId: string) => void;
  onOpenNote: (blockId: string, selectedText?: string) => void;
  onOpenPdfPage: (page: number) => void;
  fontSize: number;
  lineHeight: number;
}

export const ProseBlock: React.FC<ProseBlockProps> = ({
  block,
  annotations,
  isBookmarked,
  onToggleBookmark,
  onOpenNote,
  onOpenPdfPage,
  fontSize,
  lineHeight,
}) => {
  const blockNotes = annotations.filter(a => a.type === 'note');
  const blockHighlights = annotations.filter(a => a.type === 'highlight');
  const sourcePage = block.sourcePages?.[0] || 1;

  // Render text with embedded highlights if present
  const renderHighlightedText = () => {
    const text = block.text || '';
    if (blockHighlights.length === 0) return text;

    let segments: { text: string; color?: string }[] = [{ text }];

    for (const hl of blockHighlights) {
      if (!hl.selectedText) continue;
      const newSegments: { text: string; color?: string }[] = [];

      for (const seg of segments) {
        if (seg.color) {
          newSegments.push(seg);
          continue;
        }

        const idx = seg.text.toLowerCase().indexOf(hl.selectedText.toLowerCase());
        if (idx !== -1) {
          if (idx > 0) {
            newSegments.push({ text: seg.text.substring(0, idx) });
          }
          newSegments.push({
            text: seg.text.substring(idx, idx + hl.selectedText.length),
            color: hl.color || 'yellow',
          });
          const remainder = seg.text.substring(idx + hl.selectedText.length);
          if (remainder) {
            newSegments.push({ text: remainder });
          }
        } else {
          newSegments.push(seg);
        }
      }
      segments = newSegments;
    }

    return segments.map((seg, i) => {
      if (!seg.color) return <span key={i}>{seg.text}</span>;
      const colorClasses: Record<string, string> = {
        yellow: 'bg-amber-300/30 text-amber-900 dark:bg-amber-500/25 dark:text-amber-200 border-b-2 border-amber-400',
        green: 'bg-emerald-300/30 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-200 border-b-2 border-emerald-400',
        blue: 'bg-sky-300/30 text-sky-900 dark:bg-sky-500/25 dark:text-sky-200 border-b-2 border-sky-400',
        purple: 'bg-purple-300/30 text-purple-900 dark:bg-purple-500/25 dark:text-purple-200 border-b-2 border-purple-400',
        pink: 'bg-rose-300/30 text-rose-900 dark:bg-rose-500/25 dark:text-rose-200 border-b-2 border-rose-400',
      };
      return (
        <mark key={i} className={`rounded px-1 py-0.5 transition-colors ${colorClasses[seg.color] || colorClasses.yellow}`}>
          {seg.text}
        </mark>
      );
    });
  };

  return (
    <div
      id={block.id}
      className="group relative my-4 rounded-lg px-2 py-1 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/[0.03]"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
    >
      <div className="relative">
        <p className="leading-relaxed select-text font-normal tracking-normal text-current">
          {renderHighlightedText()}
        </p>

        {/* Existing notes indicator */}
        {blockNotes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {blockNotes.map(n => (
              <div
                key={n.id}
                onClick={() => onOpenNote(block.id)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                <MessageSquarePlus className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{n.noteText || 'Note'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Menu on Hover */}
      <div className="absolute right-2 -top-3 hidden items-center gap-1 rounded-full bg-neutral-900/90 px-2 py-1 text-xs shadow-lg backdrop-blur-md border border-neutral-700/60 group-hover:flex z-10 animate-fade-in">
        <button
          onClick={() => onToggleBookmark(block.id)}
          title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
          className={`p-1 rounded-full hover:bg-neutral-800 transition-colors ${
            isBookmarked ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5 fill-current" />
        </button>
        <button
          onClick={() => onOpenNote(block.id)}
          title="Add Note"
          className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onOpenPdfPage(sourcePage)}
          title={`View in original PDF (Page ${sourcePage})`}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-neutral-400 hover:text-indigo-300 hover:bg-neutral-800 transition-colors"
        >
          <FileText className="h-3 w-3" />
          <span>p.{sourcePage}</span>
        </button>
      </div>
    </div>
  );
};
