import React, { useState, useEffect, useRef } from 'react';
import type { BookRecord, StorageEstimateResult } from '../../types/book';
import {
  getStorageStatistics,
  requestPersistentStorage,
  clearTemporaryCache,
  clearSearchIndex,
  clearReadingHistory,
  resetPreferences,
  deleteAllAppData,
} from '../../storage/cleanup';
import { exportAllLibraryBackup, importLibraryBackup } from '../../storage/backup';
import { ConfirmDialog } from '../dialogs/ConfirmDialog';
import {
  HardDrive,
  ShieldCheck,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface DataManagementViewProps {
  books: BookRecord[];
  onBackToLibrary: () => void;
  onRefreshLibrary: () => Promise<void>;
  onDeleteBook: (bookId: string) => Promise<void>;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  books,
  onBackToLibrary,
  onRefreshLibrary,
  onDeleteBook,
}) => {
  const [stats, setStats] = useState<StorageEstimateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  // Modals state
  const [confirmClearCache, setConfirmClearCache] = useState(false);
  const [confirmClearIndex, setConfirmClearIndex] = useState(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmResetPrefs, setConfirmResetPrefs] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getStorageStatistics();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [books]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePersistRequest = async () => {
    const granted = await requestPersistentStorage();
    if (granted) {
      setStatusMessage({ text: 'Persistent storage permission granted by your browser!' });
    } else {
      setStatusMessage({ text: 'Persistent storage was not granted or already active.' });
    }
    await fetchStats();
  };

  const handleExportBackup = async () => {
    try {
      const backupJson = await exportAllLibraryBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-book-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Backup exported successfully!' });
    } catch (err: any) {
      setStatusMessage({ text: `Backup export failed: ${err.message}`, isError: true });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importLibraryBackup(text);
      await onRefreshLibrary();
      await fetchStats();
      setStatusMessage({
        text: `Restored ${result.importedBooks} books, ${result.importedSections} chapters, and ${result.importedAnnotations} notes/highlights!`,
      });
    } catch (err: any) {
      setStatusMessage({ text: `Backup restore failed: ${err.message}`, isError: true });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8f7f5] dark:bg-[#0f1015] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-[#0f1015]/80 px-6 sm:px-10 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="bouncy-btn flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Library</span>
          </button>
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#ff6934]/10 text-[#ff6934]">
              <Database className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
              Storage & Local Data Management
            </h1>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="bouncy-btn flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 sm:px-10 py-8 space-y-8">
        {/* Toast Alert Message */}
        {statusMessage && (
          <div
            className={`flex items-center justify-between rounded-2xl p-4 text-xs font-medium animate-fade-in ${
              statusMessage.isError
                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20'
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Storage Usage Hero Card */}
        <section className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#16171b] p-6 sm:p-8 shadow-xs backdrop-blur-sm transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6934] mb-1.5">
                <HardDrive className="h-4 w-4" />
                <span>Local Storage Used</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {stats ? formatBytes(stats.usage) : '— MB'}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                {stats?.quota
                  ? `of ${formatBytes(stats.quota)} allocated browser quota (${stats.percentage}%)`
                  : 'Local IndexedDB Storage'}
              </p>
            </div>

            {/* Persistent storage status */}
            <div className="flex items-center gap-3 self-start md:self-center">
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-4">
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Persistent Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      stats?.persisted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {stats?.persisted ? 'Active (Protected)' : 'Standard (Browser Evictable)'}
                  </span>
                  {!stats?.persisted && (
                    <button
                      onClick={handlePersistRequest}
                      className="bouncy-btn ml-2 rounded-xl bg-[#ff6934] px-3 py-1.5 text-xs font-semibold text-white shadow-xs shadow-[#ff6934]/20 hover:bg-[#ff551b] transition-all"
                    >
                      Request Persist
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Bar */}
          {stats && stats.quota > 0 && (
            <div className="mt-6">
              <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff6934] to-[#ff8a5c] transition-all duration-500"
                  style={{ width: `${Math.max(2, stats.percentage)}%` }}
                />
              </div>
            </div>
          )}

          {/* Storage Breakdown */}
          {stats && (
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-200/80 dark:border-neutral-800/80 pt-6 text-center text-xs">
              <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-3 sm:p-4">
                <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.booksCount}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">Books Stored</div>
              </div>
              <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-3 sm:p-4">
                <div className="text-lg sm:text-xl font-bold text-[#ff6934]">
                  {stats.blocksCount}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">Extracted Blocks</div>
              </div>
              <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-3 sm:p-4">
                <div className="text-lg sm:text-xl font-bold text-amber-500 dark:text-amber-400">
                  {stats.annotationsCount}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">Bookmarks & Notes</div>
              </div>
            </div>
          )}
        </section>

        {/* Original Books Stored Table */}
        <section className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#16171b] p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Locally Stored Books ({books.length})
            </h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">IndexedDB Blob & Data</span>
          </div>

          {books.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800/80">
              <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
                <thead className="bg-neutral-50 dark:bg-neutral-900/70 border-b border-neutral-200 dark:border-neutral-800 uppercase text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Book Title</th>
                    <th className="px-4 py-3.5">Original File</th>
                    <th className="px-4 py-3.5">Size</th>
                    <th className="px-4 py-3.5">Pages</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800 bg-white dark:bg-neutral-950/40">
                  {books.map(b => (
                    <tr
                      key={b.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-neutral-900 dark:text-white max-w-[220px] truncate">
                        {b.title}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 dark:text-neutral-400 max-w-[180px] truncate">
                        {b.originalFileName}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {formatBytes(b.fileSize)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {b.pageCount}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setBookToDelete(b)}
                          className="bouncy-btn p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete book and data"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 italic py-2">
              No books stored in database.
            </p>
          )}
        </section>

        {/* Maintenance & Cleanup Actions */}
        <section className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#16171b] p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Storage Maintenance & Cleanup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Clear Temporary Cache */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-5 transition-all">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Clear Temporary Cache
                </h4>
                <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Removes disposable session layouts and temporary canvas tokens. Preserves books and notes.
                </p>
              </div>
              <button
                onClick={() => setConfirmClearCache(true)}
                className="bouncy-btn mt-4 self-start rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs"
              >
                Clear Temp Cache
              </button>
            </div>

            {/* Clear Search Index */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-5 transition-all">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Clear Search Index
                </h4>
                <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Purges the full-text search token index. Automatically rebuilt when searching.
                </p>
              </div>
              <button
                onClick={() => setConfirmClearIndex(true)}
                className="bouncy-btn mt-4 self-start rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs"
              >
                Clear Search Index
              </button>
            </div>

            {/* Clear Reading History */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-5 transition-all">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Clear Reading History
                </h4>
                <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Resets reading position timestamps and completion checkmarks across all books.
                </p>
              </div>
              <button
                onClick={() => setConfirmClearHistory(true)}
                className="bouncy-btn mt-4 self-start rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs"
              >
                Clear History
              </button>
            </div>

            {/* Reset Reader Preferences */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-5 transition-all">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Reset Preferences
                </h4>
                <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Resets theme, font size, and layout width to default values without affecting book data.
                </p>
              </div>
              <button
                onClick={() => setConfirmResetPrefs(true)}
                className="bouncy-btn mt-4 self-start rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs"
              >
                Reset Preferences
              </button>
            </div>
          </div>
        </section>

        {/* Backup & Restore */}
        <section className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#16171b] p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Backup & Migration
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleExportBackup}
              className="bouncy-btn flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#ff6934] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#ff6934]/25 hover:bg-[#ff551b] transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Export Full Library Backup (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bouncy-btn flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs"
            >
              <Upload className="h-4 w-4" />
              <span>Restore from Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </div>
        </section>

        {/* Project & Ownership Information */}
        <section className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#16171b] p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                About & Ownership
              </h2>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Pdf-to-Book — Smart Book Reader v1.0.0
              </p>
            </div>
            <a
              href="https://github.com/Saeedbuneri/Pdf-to-Book"
              target="_blank"
              rel="noopener noreferrer"
              className="bouncy-btn flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-xs"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub Repository</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Created & Developed By
              </span>
              <div className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">
                Muhammad Saeed
              </div>
              <a
                href="https://github.com/Saeedbuneri"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#ff6934] hover:text-[#ff551b] transition-colors"
              >
                <span>github.com/Saeedbuneri</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                License & Rights
              </span>
              <div className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">
                MIT License
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                100% Local-First Open Source Software
              </p>
            </div>
          </div>
        </section>

        {/* Danger Zone: Delete All App Data */}
        <section className="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/[0.04] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-semibold">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
            Permanently erases all books, extracted content, reading positions, bookmarks, personal notes, and preferences stored on this computer.
          </p>

          <button
            onClick={() => setConfirmDeleteAll(true)}
            className="bouncy-btn rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-rose-600/20"
          >
            Delete All App Data
          </button>
        </section>
      </main>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmClearCache}
        title="Clear Temporary Cache?"
        message="This will clear disposable in-memory and session cache data. Your books, reading positions, and notes will NOT be affected."
        confirmText="Clear Cache"
        onConfirm={async () => {
          await clearTemporaryCache();
          setConfirmClearCache(false);
          setStatusMessage({ text: 'Temporary cache cleared.' });
        }}
        onCancel={() => setConfirmClearCache(false)}
      />

      <ConfirmDialog
        isOpen={confirmClearIndex}
        title="Clear Search Index?"
        message="This will clear the search token database. The index will be regenerated when you search inside your books."
        confirmText="Clear Index"
        onConfirm={async () => {
          await clearSearchIndex();
          setConfirmClearIndex(false);
          setStatusMessage({ text: 'Search index cleared.' });
        }}
        onCancel={() => setConfirmClearIndex(false)}
      />

      <ConfirmDialog
        isOpen={confirmClearHistory}
        title="Clear Reading History?"
        message="This will reset reading progress timestamps and completed section checkmarks across all books in your library."
        confirmText="Clear History"
        onConfirm={async () => {
          await clearReadingHistory();
          setConfirmClearHistory(false);
          await onRefreshLibrary();
          setStatusMessage({ text: 'Reading history reset.' });
        }}
        onCancel={() => setConfirmClearHistory(false)}
      />

      <ConfirmDialog
        isOpen={confirmResetPrefs}
        title="Reset Preferences?"
        message="This will reset reader themes, font styles, and layout sizing to default values."
        confirmText="Reset"
        onConfirm={async () => {
          await resetPreferences();
          setConfirmResetPrefs(false);
          setStatusMessage({ text: 'Preferences reset to defaults.' });
        }}
        onCancel={() => setConfirmResetPrefs(false)}
      />

      {/* Delete Book Confirmation */}
      <ConfirmDialog
        isOpen={!!bookToDelete}
        title="Permanently Delete Book?"
        message={`Are you sure you want to delete "${bookToDelete?.title}" and all its extracted chapters, bookmarks, and notes?`}
        confirmText="Delete Book"
        isDestructive={true}
        onConfirm={async () => {
          if (bookToDelete) {
            await onDeleteBook(bookToDelete.id);
            setBookToDelete(null);
            await fetchStats();
          }
        }}
        onCancel={() => setBookToDelete(null)}
      />

      {/* Delete ALL App Data Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteAll}
        title="DELETE ALL APP DATA?"
        message="This is a completely irreversible action. It will permanently wipe all stored books, extracted text, notes, bookmarks, and history from your browser."
        confirmText="Permanently Erase Everything"
        isDestructive={true}
        requireMatchText="DELETE ALL"
        onConfirm={async () => {
          await deleteAllAppData();
          setConfirmDeleteAll(false);
          await onRefreshLibrary();
          await fetchStats();
          setStatusMessage({ text: 'All application data has been wiped.' });
        }}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
};
