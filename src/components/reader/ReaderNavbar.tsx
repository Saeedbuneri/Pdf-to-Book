import React, { useState, useEffect } from 'react';
import type { BookRecord, BookSection, ReaderSettings } from '../../types/book';
import {
  ArrowLeft,
  Search,
  Maximize,
  Minimize,
  Sliders,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  Sun,
  Moon,
  Coffee,
  CircleDot,
} from 'lucide-react';

interface ReaderNavbarProps {
  book: BookRecord;
  currentSection: BookSection | null;
  settings: ReaderSettings;
  onUpdateSettings: (updates: Partial<ReaderSettings>) => void;
  onBackToLibrary: () => void;
  onOpenSearch: () => void;
  onToggleOriginalPdf: () => void;
}

export const ReaderNavbar: React.FC<ReaderNavbarProps> = ({
  book,
  currentSection,
  settings,
  onUpdateSettings,
  onBackToLibrary,
  onOpenSearch,
  onToggleOriginalPdf,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 transition-colors"
      style={{
        backgroundColor: 'var(--reader-surface)',
        borderColor: 'var(--reader-border)',
        color: 'var(--reader-text)',
      }}
    >
      {/* Left Area: Back Button & Sidebar Toggles & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
          title="Back to Library"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Library</span>
        </button>

        <div className="h-4 w-px bg-current opacity-20 shrink-0" />

        {/* Structure Sidebar Toggle */}
        <button
          onClick={() => onUpdateSettings({ showStructureSidebar: !settings.showStructureSidebar })}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
          title={settings.showStructureSidebar ? 'Hide Contents' : 'Show Contents'}
        >
          {settings.showStructureSidebar ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {/* Breadcrumb Titles */}
        <div className="flex items-center gap-2 overflow-hidden text-xs sm:text-sm">
          <span className="font-semibold truncate max-w-[140px] sm:max-w-[220px]" title={book.title}>
            {book.title}
          </span>
          {currentSection && (
            <>
              <span className="opacity-40">/</span>
              <span className="truncate max-w-[180px] sm:max-w-[280px] opacity-80" title={currentSection.title}>
                {currentSection.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Area: Search, PDF Toggle, Settings, Focus Mode */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* In-Book Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="Search in this book"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search</span>
        </button>

        {/* Original PDF Toggle */}
        <button
          onClick={onToggleOriginalPdf}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="View Original PDF Page"
        >
          <FileText className="h-4 w-4 text-indigo-400" />
          <span className="hidden md:inline">Original PDF</span>
        </button>

        {/* Focus Mode Toggle */}
        <button
          onClick={() => {
            const nextFocus = !settings.focusMode;
            onUpdateSettings({
              focusMode: nextFocus,
              showStructureSidebar: !nextFocus,
              showContextSidebar: !nextFocus,
            });
          }}
          className={`bouncy-btn p-1.5 rounded-lg transition-colors ${
            settings.focusMode
              ? 'bg-[#ff6934] text-white shadow-md shadow-[#ff6934]/25'
              : 'hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          title={settings.focusMode ? 'Exit Focus Mode' : 'Focus Mode (Distraction-Free)'}
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Reading Settings Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="bouncy-btn p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Reading Preferences (Theme, Font, Spacing)"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Settings Dropdown Popover */}
          {settingsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 z-50 w-72 rounded-3xl border p-5 shadow-2xl backdrop-blur-xl animate-fade-in text-xs"
                style={{
                  backgroundColor: 'var(--reader-surface)',
                  borderColor: 'var(--reader-border)',
                  color: 'var(--reader-text)',
                }}
              >
                <h4 className="font-semibold uppercase tracking-wider opacity-60 mb-3 font-sans">
                  Reading Preferences
                </h4>

                {/* Theme Selector */}
                <div className="mb-4">
                  <label className="block text-[11px] font-medium opacity-70 mb-2">Theme</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'paper', label: 'Paper', icon: Sun, bg: 'bg-[#faf8f5]', border: 'border-[#e6e0d4]', text: 'text-[#2c3038]' },
                      { id: 'sepia', label: 'Sepia', icon: Coffee, bg: 'bg-[#f4ecd8]', border: 'border-[#d4c5a3]', text: 'text-[#433422]' },
                      { id: 'dark', label: 'Dark', icon: Moon, bg: 'bg-[#12131a]', border: 'border-[#2d3043]', text: 'text-[#e0e4ee]' },
                      { id: 'midnight', label: 'OLED', icon: CircleDot, bg: 'bg-[#000000]', border: 'border-[#1e1e24]', text: 'text-[#d4d4d8]' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => onUpdateSettings({ theme: t.id as any })}
                        className={`bouncy-pill flex flex-col items-center gap-1 rounded-xl p-2 border transition-all ${t.bg} ${t.text} ${
                          settings.theme === t.id ? 'ring-2 ring-[#ff6934] font-bold scale-105 shadow-md' : t.border
                        }`}
                      >
                        <t.icon className="h-4 w-4" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family Selector */}
                <div className="mb-4">
                  <label className="block text-[11px] font-medium opacity-70 mb-2">Font Family</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sans', label: 'Modern Sans', style: 'font-book-sans' },
                      { id: 'serif', label: 'Book Serif', style: 'font-book-serif' },
                      { id: 'mono', label: 'Technical', style: 'font-book-mono' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateSettings({ fontFamily: f.id as any })}
                        className={`bouncy-pill rounded-xl py-2 px-2 border text-center transition-all ${f.style} ${
                          settings.fontFamily === f.id
                            ? 'bg-[#ff6934] text-white border-[#ff6934] font-semibold shadow-md shadow-[#ff6934]/25'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 border-current/20'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Adjuster */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium opacity-70">Font Size</span>
                    <span className="font-semibold">{settings.fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
                      className="bouncy-btn h-8 w-8 rounded-lg border border-current/20 hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min={14}
                      max={28}
                      value={settings.fontSize}
                      onChange={e => onUpdateSettings({ fontSize: Number(e.target.value) })}
                      className="flex-1 accent-[#ff6934] cursor-pointer"
                    />
                    <button
                      onClick={() => onUpdateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
                      className="bouncy-btn h-8 w-8 rounded-lg border border-current/20 hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Reading Width */}
                <div>
                  <label className="block text-[11px] font-medium opacity-70 mb-2">Reading Width</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'narrow', label: 'Narrow' },
                      { id: 'normal', label: 'Normal' },
                      { id: 'wide', label: 'Wide' },
                      { id: 'full', label: 'Full' },
                    ].map(w => (
                      <button
                        key={w.id}
                        onClick={() => onUpdateSettings({ readingWidth: w.id as any })}
                        className={`bouncy-pill rounded-lg py-1.5 text-center transition-all ${
                          settings.readingWidth === w.id
                            ? 'bg-[#ff6934] text-white font-semibold shadow-sm'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 border border-current/10'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>

        {/* Context Sidebar Toggle */}
        <button
          onClick={() => onUpdateSettings({ showContextSidebar: !settings.showContextSidebar })}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
          title={settings.showContextSidebar ? 'Hide Tools' : 'Show Tools'}
        >
          {settings.showContextSidebar ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
};
