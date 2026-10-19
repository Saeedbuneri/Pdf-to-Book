import { db, type SearchIndexEntry } from './database';
import type { BookRecord, BookSection, ContentBlock } from '../types/book';

export async function getAllBooks(): Promise<BookRecord[]> {
  return await db.books.orderBy('createdAt').reverse().toArray();
}

export async function getBook(id: string): Promise<BookRecord | undefined> {
  return await db.books.get(id);
}

export async function saveBook(book: BookRecord): Promise<void> {
  await db.books.put(book);
}

export async function updateBook(id: string, updates: Partial<BookRecord>): Promise<void> {
  await db.books.update(id, updates);
}

export async function saveSections(sections: BookSection[]): Promise<void> {
  await db.sections.bulkPut(sections);
}

export async function getSectionsForBook(bookId: string): Promise<BookSection[]> {
  const sections = await db.sections.where('bookId').equals(bookId).toArray();
  return sections.sort((a, b) => a.order - b.order);
}

export async function saveBlocks(blocks: ContentBlock[]): Promise<void> {
  await db.blocks.bulkPut(blocks);

  // Incrementally index searchable text
  const indexEntries: SearchIndexEntry[] = blocks
    .filter(b => b.text && b.text.trim().length > 0)
    .map(b => ({
      id: b.id,
      bookId: b.bookId,
      sectionId: b.sectionId,
      blockId: b.id,
      sourcePage: b.sourcePages?.[0] || 1,
      content: (b.text || '').toLowerCase(),
    }));

  if (indexEntries.length > 0) {
    await db.searchIndex.bulkPut(indexEntries);
  }
}

export async function getBlocksForSection(sectionId: string): Promise<ContentBlock[]> {
  const blocks = await db.blocks.where('sectionId').equals(sectionId).toArray();
  // FIX #15: Sort by source page (then by block order within same page) for consistent ordering
  // after backup restores or partial re-processing.
  return blocks.sort((a, b) => {
    const pageA = a.sourcePages?.[0] ?? 0;
    const pageB = b.sourcePages?.[0] ?? 0;
    return pageA - pageB;
  });
}

export async function getBlocksForBook(bookId: string): Promise<ContentBlock[]> {
  return await db.blocks.where('bookId').equals(bookId).toArray();
}

export async function deleteBookAndData(bookId: string): Promise<void> {
  await db.transaction('rw', [db.books, db.sections, db.blocks, db.progress, db.annotations, db.searchIndex], async () => {
    await db.books.delete(bookId);
    await db.sections.where('bookId').equals(bookId).delete();
    await db.blocks.where('bookId').equals(bookId).delete();
    await db.progress.delete(bookId);
    await db.annotations.where('bookId').equals(bookId).delete();
    await db.searchIndex.where('bookId').equals(bookId).delete();
  });
}

export async function storeBookBlob(bookId: string, blob: Blob): Promise<void> {
  await db.books.update(bookId, { pdfBlob: blob });
}

export async function getBookBlob(bookId: string): Promise<Blob | undefined> {
  const book = await db.books.get(bookId);
  return book?.pdfBlob;
}
