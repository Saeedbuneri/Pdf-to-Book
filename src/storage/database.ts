import Dexie, { type EntityTable } from 'dexie';
import type {
  BookRecord,
  BookSection,
  ContentBlock,
  ReadingProgress,
  AnnotationRecord,
} from '../types/book';

export interface SearchIndexEntry {
  id: string;
  bookId: string;
  sectionId: string;
  blockId: string;
  sourcePage: number;
  content: string;
}

export class BookReaderDatabase extends Dexie {
  books!: EntityTable<BookRecord, 'id'>;
  sections!: EntityTable<BookSection, 'id'>;
  blocks!: EntityTable<ContentBlock, 'id'>;
  progress!: EntityTable<ReadingProgress, 'bookId'>;
  annotations!: EntityTable<AnnotationRecord, 'id'>;
  searchIndex!: EntityTable<SearchIndexEntry, 'id'>;

  constructor() {
    super('SmartBookReaderDB');
    this.version(1).stores({
      books: 'id, title, genre, storageStatus, processingStatus, createdAt, lastOpenedAt',
      sections: 'id, bookId, level, order, parentSectionId',
      blocks: 'id, bookId, sectionId, type, [bookId+sectionId]',
      progress: 'bookId, sectionId, updatedAt',
      annotations: 'id, bookId, sectionId, blockId, type, createdAt, [bookId+type]',
      searchIndex: 'id, bookId, sectionId, blockId',
    });
  }
}

export const db = new BookReaderDatabase();
