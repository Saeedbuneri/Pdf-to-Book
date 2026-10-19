import React from 'react';
import type { ContentBlock } from '../types/book';
import { Lightbulb, AlertCircle, Quote, FileText } from 'lucide-react';

interface QuoteBlockProps {
  block: ContentBlock;
  onOpenPdfPage: (page: number) => void;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ block, onOpenPdfPage }) => {
  const text = block.text || '';
  const sourcePage = block.sourcePages?.[0] || 1;
  const lower = text.toLowerCase();

  const isWarning = lower.startsWith('warning:') || lower.startsWith('caution:');
  const isKeyConcept = lower.startsWith('key concept:') || lower.startsWith('definition:');

  const getIcon = () => {
    if (isWarning) return <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />;
    if (isKeyConcept) return <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />;
    return <Quote className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />;
  };

  const getBorderColor = () => {
    if (isWarning) return 'border-l-amber-500 bg-amber-500/[0.06] text-amber-950 dark:text-amber-100';
    if (isKeyConcept) return 'border-l-emerald-500 bg-emerald-500/[0.06] text-emerald-950 dark:text-emerald-100';
    return 'border-l-indigo-500 bg-indigo-500/[0.06] text-indigo-950 dark:text-indigo-100';
  };

  return (
    <div
      id={block.id}
      className={`my-5 rounded-r-xl border-l-4 p-4 shadow-sm transition-all ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {getIcon()}
          <div className="text-sm sm:text-base leading-relaxed italic font-medium">
            {text.replace(/^>\s*/, '')}
          </div>
        </div>

        <button
          onClick={() => onOpenPdfPage(sourcePage)}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-indigo-300 transition-colors shrink-0"
        >
          <FileText className="h-3 w-3" />
          <span>p.{sourcePage}</span>
        </button>
      </div>
    </div>
  );
};
