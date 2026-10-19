import { db } from './database';
import type { StorageEstimateResult } from '../types/book';

export async function getStorageStatistics(): Promise<StorageEstimateResult> {
  let usage = 0;
  let quota = 0;
  let persisted = false;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usage = estimate.usage || 0;
      quota = estimate.quota || 0;
    } catch {
      // Ignore unsupported browsers
    }
  }

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      persisted = await navigator.storage.persisted();
    } catch {
      persisted = false;
    }
  }

  const [booksCount, blocksCount, annotationsCount] = await Promise.all([
    db.books.count(),
    db.blocks.count(),
    db.annotations.count(),
  ]);

  const percentage = quota > 0 ? Math.min(100, Math.round((usage / quota) * 100)) : 0;

  return {
    usage,
    quota,
    percentage,
    persisted,
    booksCount,
    blocksCount,
    annotationsCount,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

export async function clearTemporaryCache(): Promise<void> {
  // Clears any temporary object URLs and layout sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.clear();
  }
}

export async function rebuildSearchIndex(): Promise<number> {
  await db.searchIndex.clear();
  const blocks = await db.blocks.toArray();
  const entries = blocks
    .filter(b => b.text && b.text.trim().length > 0)
    .map(b => ({
      id: b.id,
      bookId: b.bookId,
      sectionId: b.sectionId,
      blockId: b.id,
      sourcePage: b.sourcePages?.[0] || 1,
      content: (b.text || '').toLowerCase(),
    }));

  if (entries.length > 0) {
    const CHUNK = 500;
    for (let i = 0; i < entries.length; i += CHUNK) {
      await db.searchIndex.bulkPut(entries.slice(i, i + CHUNK));
    }
  }
  return entries.length;
}

export async function clearSearchIndex(): Promise<void> {
  await db.searchIndex.clear();
}

export async function clearReadingHistory(): Promise<void> {
  await db.progress.clear();
  const books = await db.books.toArray();
  for (const book of books) {
    await db.books.update(book.id, { lastOpenedAt: undefined });
  }
}

export async function resetPreferences(): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('smart_reader_settings');
  }
}

export async function deleteAllAppData(): Promise<void> {
  await db.transaction('rw', [db.books, db.sections, db.blocks, db.progress, db.annotations, db.searchIndex], async () => {
    await db.books.clear();
    await db.sections.clear();
    await db.blocks.clear();
    await db.progress.clear();
    await db.annotations.clear();
    await db.searchIndex.clear();
  });

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('smart_reader_settings');
    window.sessionStorage.clear();
  }
}
