import React from 'react';
import type { ContentBlock } from '../types/book';
import { Table as TableIcon, FileText } from 'lucide-react';

interface TableBlockProps {
  block: ContentBlock;
  onOpenPdfPage: (page: number) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ block, onOpenPdfPage }) => {
  const tableData = block.tableData;
  const sourcePage = block.sourcePages?.[0] || 1;

  if (!tableData || (!tableData.headers?.length && !tableData.rows?.length)) {
    return (
      <div id={block.id} className="my-4 p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-sm font-mono text-neutral-300">
        <pre className="overflow-x-auto">{block.text}</pre>
      </div>
    );
  }

  return (
    <div id={block.id} className="my-6 rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2 font-medium">
          <TableIcon className="h-3.5 w-3.5 text-indigo-400" />
          <span>Extracted Table</span>
        </div>
        <button
          onClick={() => onOpenPdfPage(sourcePage)}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-indigo-300 transition-colors"
        >
          <FileText className="h-3 w-3" />
          <span>PDF p.{sourcePage}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-200">
          {tableData.headers?.length > 0 && (
            <thead className="bg-neutral-800/80 text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-700/60">
              <tr>
                {tableData.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-neutral-800/60">
            {tableData.rows?.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-neutral-800/30 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-neutral-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
