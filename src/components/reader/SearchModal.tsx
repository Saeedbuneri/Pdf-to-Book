import React, { useState, useEffect, useRef } from 'react';
import type { BookSection, ContentBlock, SearchResult } from '../../types/book';
import { searchInBook } from '../../core/search';
import { Search, X, FileText, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  bookId: string;
  sections: BookSection[];
  blocks?: ContentBlock[];
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (sectionId: string, blockId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  bookId,
  sections,
  blocks,
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchInBook(bookId, trimmed, sections, blocks);
      setResults(res);
      setSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, bookId, sections, blocks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-16 sm:pt-24 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-neutral-800 px-4 py-3 bg-neutral-950">
          <Search className="h-5 w-5 text-indigo-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search text, code, or formulas in this book..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-neutral-400 hover:text-white mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 text-xs sm:text-sm">
          {searching && (
            <div className="py-8 text-center text-neutral-400">Searching book text...</div>
          )}

          {!searching && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-neutral-400">
              No matching passages found for "{query}".
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-2">
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Found {results.length} Occurrences
              </div>
              {results.map((r, i) => (
                <div
                  key={`${r.sectionId}_${r.blockId}_${i}`}
                  onClick={() => {
                    onSelectResult(r.sectionId, r.blockId);
                    onClose();
                  }}
                  className="group flex cursor-pointer items-start justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 hover:border-indigo-500/50 hover:bg-neutral-850 transition-all"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-indigo-400 truncate max-w-[200px]">
                        {r.sectionTitle}
                      </span>
                      <span className="text-neutral-600">•</span>
                      <span className="flex items-center gap-1 text-neutral-400">
                        <FileText className="h-3 w-3" />
                        <span>p.{r.sourcePage}</span>
                      </span>
                    </div>

                    <p className="text-neutral-300 leading-relaxed text-xs sm:text-sm">
                      {r.surroundingSnippet}
                    </p>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-indigo-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
