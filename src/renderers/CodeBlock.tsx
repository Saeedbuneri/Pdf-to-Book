import React, { useState } from 'react';
import type { ContentBlock } from '../types/book';
import { Check, Copy, Terminal, FileText } from 'lucide-react';

interface CodeBlockProps {
  block: ContentBlock;
  onOpenPdfPage: (page: number) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ block, onOpenPdfPage }) => {
  const [copied, setCopied] = useState(false);
  const code = block.text || '';
  const language = block.language || 'code';
  const sourcePage = block.sourcePages?.[0] || 1;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const lines = code.split('\n');

  return (
    <div id={block.id} className="my-6 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl font-mono text-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold uppercase tracking-wider text-neutral-300">{language}</span>
          <span className="text-neutral-600">•</span>
          <button
            onClick={() => onOpenPdfPage(sourcePage)}
            className="flex items-center gap-1 text-[11px] hover:text-indigo-300 transition-colors"
          >
            <FileText className="h-3 w-3" />
            <span>PDF p.{sourcePage}</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-all duration-150"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto p-4 text-neutral-200 leading-relaxed font-book-mono">
        <pre className="flex">
          {/* Line Numbers */}
          <div className="select-none pr-4 text-right text-neutral-600 text-xs font-mono border-r border-neutral-800/60 mr-4">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Text */}
          <code className="flex-1 font-mono text-xs sm:text-sm">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line || ' '}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
