import React from 'react';
import {
  LayoutGrid,
  Search,
  BookOpen,
  Bookmark,
  Database,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface SidebarRailProps {
  currentView: 'library' | 'reader' | 'data-management';
  onNavigate: (view: 'library' | 'reader' | 'data-management') => void;
  hasActiveBook: boolean;
  theme: string;
  onToggleTheme: () => void;
  onOpenSearch?: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  currentView,
  onNavigate,
  hasActiveBook,
  theme,
  onToggleTheme,
  onOpenSearch,
}) => {
  const isDark = theme === 'dark' || theme === 'midnight';

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-18 sm:w-20 flex-col items-center justify-between border-r border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-[#121318]/90 py-6 backdrop-blur-xl shrink-0 transition-all select-none">
      {/* Top Logo Icon */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => onNavigate('library')}
          className="bouncy-btn flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ff5722] to-[#ff7b47] text-white shadow-lg shadow-[#ff6934]/30 ring-4 ring-[#ff6934]/15"
          title="Smart Book Reader Home"
        >
          <Layers className="h-6 w-6" />
        </button>

        {/* Primary Navigation Icons */}
        <nav className="flex flex-col items-center gap-3">
          {/* Library / Dashboard */}
          <button
            onClick={() => onNavigate('library')}
            className={`bouncy-btn relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
              currentView === 'library'
                ? 'bg-[#ff6934]/15 text-[#ff6934] font-bold shadow-inner'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Library"
          >
            <LayoutGrid className="h-5 w-5" />
            {currentView === 'library' && (
              <span className="absolute -left-1 h-5 w-1 rounded-r-full bg-[#ff6934]" />
            )}
          </button>

          {/* Search Trigger */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="bouncy-btn flex h-11 w-11 items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all"
              title="Search Books"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Reading Workspace */}
          <button
            disabled={!hasActiveBook}
            onClick={() => onNavigate('reader')}
            className={`bouncy-btn relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
              currentView === 'reader'
                ? 'bg-[#ff6934]/15 text-[#ff6934] font-bold shadow-inner'
                : hasActiveBook
                ? 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                : 'text-neutral-300 dark:text-neutral-700 opacity-40 cursor-not-allowed'
            }`}
            title={hasActiveBook ? 'Active Reader' : 'Open a book from Library first'}
          >
            <BookOpen className="h-5 w-5" />
            {currentView === 'reader' && (
              <span className="absolute -left-1 h-5 w-1 rounded-r-full bg-[#ff6934]" />
            )}
          </button>

          {/* Bookmarks / Notes shortcut */}
          <button
            onClick={() => {
              if (hasActiveBook) onNavigate('reader');
              else onNavigate('library');
            }}
            className="bouncy-btn flex h-11 w-11 items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all"
            title="Bookmarks & Notes"
          >
            <Bookmark className="h-5 w-5" />
          </button>

          {/* Data & Storage Management */}
          <button
            onClick={() => onNavigate('data-management')}
            className={`bouncy-btn relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
              currentView === 'data-management'
                ? 'bg-[#ff6934]/15 text-[#ff6934] font-bold shadow-inner'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Storage & Data Management"
          >
            <Database className="h-5 w-5" />
            {currentView === 'data-management' && (
              <span className="absolute -left-1 h-5 w-1 rounded-r-full bg-[#ff6934]" />
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Controls: GitHub, Theme Toggle & Avatar */}
      <div className="flex flex-col items-center gap-3">
        {/* GitHub Repository */}
        <a
          href="https://github.com/Saeedbuneri/Pdf-to-Book"
          target="_blank"
          rel="noopener noreferrer"
          className="bouncy-btn flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          title="GitHub: Muhammad Saeed (Saeedbuneri)"
        >
          <GithubIcon className="h-5 w-5" />
        </a>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="bouncy-btn flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          title={isDark ? 'Switch to Cozy Paper Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Stylized User Avatar */}
        <a
          href="https://github.com/Saeedbuneri"
          target="_blank"
          rel="noopener noreferrer"
          className="relative cursor-pointer group"
          title="Muhammad Saeed (@Saeedbuneri)"
        >
          <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-neutral-300 dark:ring-neutral-700 transition-all group-hover:ring-[#ff6934]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Muhammad Saeed"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Green Online Local Dot */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
        </a>
      </div>
    </aside>
  );
};
