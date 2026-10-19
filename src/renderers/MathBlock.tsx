import React, { useMemo } from 'react';
import katex from 'katex';
import type { ContentBlock } from '../types/book';
import { Sigma, FileText } from 'lucide-react';

interface MathBlockProps {
  block: ContentBlock;
  onOpenPdfPage: (page: number) => void;
}

export const MathBlock: React.FC<MathBlockProps> = ({ block, onOpenPdfPage }) => {
  const formula = block.mathLatex || block.text || '';
  const sourcePage = block.sourcePages?.[0] || 1;

  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [formula]);

  return (
    <div id={block.id} className="my-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 text-xs text-indigo-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Sigma className="h-4 w-4" />
          <span className="uppercase tracking-wider font-semibold">Formula / Equation</span>
        </div>
        <button
          onClick={() => onOpenPdfPage(sourcePage)}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-indigo-300 transition-colors"
        >
          <FileText className="h-3 w-3" />
          <span>PDF p.{sourcePage}</span>
        </button>
      </div>

      <div className="overflow-x-auto py-2 text-center">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} className="inline-block text-lg" />
        ) : (
          <code className="font-mono text-sm px-2 py-1 bg-black/10 rounded">{formula}</code>
        )}
      </div>
    </div>
  );
};
