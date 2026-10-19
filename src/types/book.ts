export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'code'
  | 'math'
  | 'figure'
  | 'table'
  | 'quote'
  | 'callout';

export interface ContentBlock {
  id: string;
  bookId: string;
  sectionId: string;
  type: ContentBlockType;
  text?: string;
  level?: 1 | 2 | 3 | 4; // For headings
  language?: string; // For code blocks
  mathLatex?: string; // For KaTeX
  isInlineMath?: boolean;
  assetId?: string;
  imageUrl?: string;
  caption?: string;
  listItems?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  sourcePages: number[];
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface BookSection {
  id: string;
  bookId: string;
  title: string;
  level: number;
  order: number;
  parentSectionId?: string | null;
  blockIds: string[];
  childSectionIds: string[];
  pageStart: number;
  pageEnd: number;
}

export type StorageStatus = 'available' | 'missing';
export type ProcessingStatus = 'queued' | 'processing' | 'ready' | 'partial' | 'error';
export type BookGenre = 'programming' | 'math-science' | 'prose' | 'general';

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  genre: BookGenre;
  coverUrl?: string;
  originalFileName: string;
  fileSize: number;
  pageCount: number;
  storageStatus: StorageStatus;
  processingStatus: ProcessingStatus;
  lastProcessedPage: number;
  extractionVersion: number;
  createdAt: number;
  lastOpenedAt?: number;
  pdfBlob?: Blob; // Stored in IndexedDB for 100% offline access
  confidenceSummary?: {
    headingsCount: number;
    codeCount: number;
    mathCount: number;
    totalBlocks: number;
  };
}

export interface ReadingProgress {
  bookId: string;
  sectionId: string;
  blockId?: string;
  characterOffset?: number;
  scrollPercentage?: number;
  completedSections: string[];
  updatedAt: number;
}

export type AnnotationType = 'highlight' | 'note' | 'bookmark';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export interface AnnotationRecord {
  id: string;
  bookId: string;
  sectionId: string;
  blockId: string;
  type: AnnotationType;
  color?: HighlightColor;
  selectedText?: string;
  noteText?: string;
  createdAt: number;
  updatedAt: number;
}

export type ReaderTheme = 'paper' | 'sepia' | 'dark' | 'midnight';
export type ReaderFontFamily = 'sans' | 'serif' | 'mono';
export type ReadingWidth = 'narrow' | 'normal' | 'wide' | 'full';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontFamily: ReaderFontFamily;
  fontSize: number; // in pixels (e.g. 18)
  lineHeight: number; // (e.g. 1.7)
  readingWidth: ReadingWidth;
  navigationMode: 'topic' | 'page';
  focusMode: boolean;
  showStructureSidebar: boolean;
  showContextSidebar: boolean;
}

export interface SearchResult {
  blockId: string;
  sectionId: string;
  sectionTitle: string;
  sourcePage: number;
  matchText: string;
  surroundingSnippet: string;
}

export interface StorageEstimateResult {
  usage: number; // in bytes
  quota: number; // in bytes
  percentage: number;
  persisted: boolean;
  booksCount: number;
  blocksCount: number;
  annotationsCount: number;
}
