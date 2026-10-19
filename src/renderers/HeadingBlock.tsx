import React from 'react';
import type { ContentBlock } from '../types/book';
import { Hash, FileText } from 'lucide-react';

interface HeadingBlockProps {
  block: ContentBlock;
  onOpenPdfPage: (page: number) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, onOpenPdfPage }) => {
  const level = block.level || 1;
  const sourcePage = block.sourcePages?.[0] || 1;

  const getHeadingElement = () => {
    switch (level) {
      case 1:
        return (
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-10 mb-4 text-inherit flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-3">
            <span>{block.text}</span>
            <button
              onClick={() => onOpenPdfPage(sourcePage)}
              className="text-xs font-normal text-neutral-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title={`Source: PDF Page ${sourcePage}`}
            >
              <FileText className="h-3 w-3" />
              <span>Page {sourcePage}</span>
            </button>
          </h2>
        );
      case 2:
        return (
          <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mt-8 mb-3 text-inherit flex items-baseline justify-between">
            <span>{block.text}</span>
            <button
              onClick={() => onOpenPdfPage(sourcePage)}
              className="text-xs font-normal text-neutral-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title={`Source: PDF Page ${sourcePage}`}
            >
              <FileText className="h-3 w-3" />
              <span>Page {sourcePage}</span>
            </button>
          </h3>
        );
      case 3:
      default:
        return (
          <h4 className="text-lg font-medium tracking-tight mt-6 mb-2 text-inherit flex items-baseline justify-between">
            <span>{block.text}</span>
            <button
              onClick={() => onOpenPdfPage(sourcePage)}
              className="text-xs font-normal text-neutral-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title={`Source: PDF Page ${sourcePage}`}
            >
              <FileText className="h-3 w-3" />
              <span>p.{sourcePage}</span>
            </button>
          </h4>
        );
    }
  };

  return (
    <div id={block.id} className="group relative scroll-mt-20">
      <a
        href={`#${block.id}`}
        className="absolute -left-6 top-1/2 -translate-y-1/2 hidden p-1 text-neutral-400 hover:text-indigo-400 group-hover:inline-block transition-colors"
        title="Direct Link"
      >
        <Hash className="h-4 w-4" />
      </a>
      {getHeadingElement()}
    </div>
  );
};
