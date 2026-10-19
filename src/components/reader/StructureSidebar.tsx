import React, { useState } from 'react';
import type { BookSection } from '../../types/book';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Search,
  BookMarked,
} from 'lucide-react';

interface StructureSidebarProps {
  sections: BookSection[];
  activeSectionId: string;
  completedSectionIds: string[];
  onSelectSection: (sectionId: string) => void;
  isOpen: boolean;
}

export const StructureSidebar: React.FC<StructureSidebarProps> = ({
  sections,
  activeSectionId,
  completedSectionIds,
  onSelectSection,
  isOpen,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = sections.filter(s =>
    s.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <aside
      className="flex h-[calc(100vh-3.5rem)] w-72 sm:w-80 flex-col border-r shrink-0 overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--reader-surface)',
        borderColor: 'var(--reader-border)',
        color: 'var(--reader-text)',
      }}
    >
      {/* Header with Search */}
      <div className="p-3.5 border-b border-inherit space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
            <BookMarked className="h-4 w-4 text-indigo-400" />
            <span>Contents</span>
          </div>
          <span className="text-[11px] opacity-60 font-medium">
            {sections.length} Topics
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
          <input
            type="text"
            placeholder="Filter topics..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full rounded-lg bg-black/5 dark:bg-white/5 border border-inherit py-1.5 pl-8 pr-3 text-xs placeholder-current opacity-70 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Sections Outline List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(section => {
          const isActive = section.id === activeSectionId;
          const isCompleted = completedSectionIds.includes(section.id);
          const hasChildren = section.childSectionIds && section.childSectionIds.length > 0;
          const isCollapsed = collapsedMap[section.id] || false;

          const indentPadding =
            section.level === 1 ? 'pl-2' : section.level === 2 ? 'pl-6' : 'pl-9';

          return (
            <div key={section.id}>
              <div
                onClick={() => onSelectSection(section.id)}
                className={`group flex items-center justify-between rounded-xl py-2 px-2.5 text-xs transition-all cursor-pointer ${indentPadding} ${
                  isActive
                    ? 'bg-[#ff6934] text-white font-semibold shadow-md shadow-[#ff6934]/25 scale-[1.01]'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                  {/* Expand / Collapse for parent sections */}
                  {hasChildren ? (
                    <button
                      onClick={e => toggleCollapse(section.id, e)}
                      className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}

                  {/* Completion checkmark */}
                  {isCompleted ? (
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-emerald-400'
                      }`}
                    />
                  ) : (
                    <Circle
                      className={`h-3 w-3 shrink-0 opacity-30 group-hover:opacity-60 ${
                        isActive ? 'text-white' : ''
                      }`}
                    />
                  )}

                  <span className="truncate">{section.title}</span>
                </div>

                {/* Page range badge */}
                <span
                  className={`text-[10px] shrink-0 px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'opacity-50'
                  }`}
                >
                  p.{section.pageStart}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
