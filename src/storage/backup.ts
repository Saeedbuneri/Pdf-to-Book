import { db } from './database';
import type { BookRecord, BookSection, ContentBlock, ReadingProgress, AnnotationRecord } from '../types/book';
import { saveBlocks } from './book-store';

export interface LibraryBackupData {
  version: 1;
  exportedAt: number;
  books: BookRecord[];
  sections: BookSection[];
  blocks: ContentBlock[];
  progress: ReadingProgress[];
  annotations: AnnotationRecord[];
}

export async function exportAllLibraryBackup(): Promise<string> {
  const books = await db.books.toArray();
  // Strip binary blobs from JSON backup for portable size
  const sanitizedBooks = books.map(b => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pdfBlob, ...rest } = b;
    return rest as BookRecord;
  });

  const sections = await db.sections.toArray();
  const blocks = await db.blocks.toArray();
  const progress = await db.progress.toArray();
  const annotations = await db.annotations.toArray();

  const backup: LibraryBackupData = {
    version: 1,
    exportedAt: Date.now(),
    books: sanitizedBooks,
    sections,
    blocks,
    progress,
    annotations,
  };

  return JSON.stringify(backup, null, 2);
}

export async function exportBookAnnotationsMarkdown(bookId: string): Promise<string> {
  const book = await db.books.get(bookId);
  const annotations = await db.annotations.where('bookId').equals(bookId).toArray();

  let md = `# Notes & Highlights for "${book?.title || 'Unknown Book'}"\n\n`;
  md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

  const highlights = annotations.filter(a => a.type === 'highlight');
  const notes = annotations.filter(a => a.type === 'note');
  const bookmarks = annotations.filter(a => a.type === 'bookmark');

  if (highlights.length > 0) {
    md += `## Highlights (${highlights.length})\n\n`;
    highlights.forEach(h => {
      md += `> "${h.selectedText || ''}"\n\n*(Color: ${h.color || 'yellow'})*\n\n`;
    });
  }

  if (notes.length > 0) {
    md += `## Personal Notes (${notes.length})\n\n`;
    notes.forEach(n => {
      if (n.selectedText) {
        md += `**Reference:** "${n.selectedText}"\n\n`;
      }
      md += `**Note:** ${n.noteText || ''}\n\n---\n\n`;
    });
  }

  if (bookmarks.length > 0) {
    // FIX #20: Resolve block text for bookmarks so the export is human-readable
    md += `## Bookmarks (${bookmarks.length})\n\n`;
    for (let i = 0; i < bookmarks.length; i++) {
      const bm = bookmarks[i];
      const block = await db.blocks.get(bm.blockId);
      const snippet = block?.text
        ? block.text.substring(0, 120) + (block.text.length > 120 ? '...' : '')
        : `Block: ${bm.blockId}`;
      md += `${i + 1}. ${snippet}\n`;
    }
  }

  return md;
}

export async function importLibraryBackup(jsonString: string): Promise<{
  importedBooks: number;
  importedSections: number;
  importedBlocks: number;
  importedAnnotations: number;
}> {
  const data = JSON.parse(jsonString) as LibraryBackupData;

  if (!data || !Array.isArray(data.books)) {
    throw new Error('Invalid backup format: missing books array.');
  }

  await db.transaction('rw', [db.books, db.sections, db.blocks, db.progress, db.annotations], async () => {
    if (data.books?.length) {
      await db.books.bulkPut(data.books);
    }
    if (data.sections?.length) {
      await db.sections.bulkPut(data.sections);
    }
    if (data.progress?.length) {
      await db.progress.bulkPut(data.progress);
    }
    if (data.annotations?.length) {
      await db.annotations.bulkPut(data.annotations);
    }
  });

  // FIX #4: Rebuild the searchIndex after import — saveBlocks writes both the blocks
  // and the search index entries, ensuring search works immediately after restore.
  if (data.blocks?.length) {
    const CHUNK = 200;
    for (let i = 0; i < data.blocks.length; i += CHUNK) {
      await saveBlocks(data.blocks.slice(i, i + CHUNK));
    }
  }

  return {
    importedBooks: data.books?.length || 0,
    importedSections: data.sections?.length || 0,
    importedBlocks: data.blocks?.length || 0,
    importedAnnotations: data.annotations?.length || 0,
  };
}
