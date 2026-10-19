import { db } from './database';
import type { AnnotationRecord, HighlightColor } from '../types/book';

export async function getAnnotationsForBook(bookId: string): Promise<AnnotationRecord[]> {
  return await db.annotations.where('bookId').equals(bookId).toArray();
}

export async function getAnnotationsForSection(sectionId: string): Promise<AnnotationRecord[]> {
  return await db.annotations.where('sectionId').equals(sectionId).toArray();
}

export async function saveAnnotation(annotation: AnnotationRecord): Promise<void> {
  await db.annotations.put(annotation);
}

export async function deleteAnnotation(id: string): Promise<void> {
  await db.annotations.delete(id);
}

export async function toggleBookmark(
  bookId: string,
  sectionId: string,
  blockId: string
): Promise<boolean> {
  const existing = await db.annotations
    .where('bookId')
    .equals(bookId)
    .and(a => a.type === 'bookmark' && a.blockId === blockId)
    .first();

  if (existing) {
    await db.annotations.delete(existing.id);
    return false;
  } else {
    const newBookmark: AnnotationRecord = {
      id: 'bm_' + Math.random().toString(36).substring(2, 9),
      bookId,
      sectionId,
      blockId,
      type: 'bookmark',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.annotations.put(newBookmark);
    return true;
  }
}

export async function addHighlight(
  bookId: string,
  sectionId: string,
  blockId: string,
  selectedText: string,
  color: HighlightColor = 'yellow'
): Promise<AnnotationRecord> {
  const record: AnnotationRecord = {
    id: 'hl_' + Math.random().toString(36).substring(2, 9),
    bookId,
    sectionId,
    blockId,
    type: 'highlight',
    color,
    selectedText,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.annotations.put(record);
  return record;
}

export async function addNote(
  bookId: string,
  sectionId: string,
  blockId: string,
  noteText: string,
  selectedText?: string
): Promise<AnnotationRecord> {
  const record: AnnotationRecord = {
    id: 'nt_' + Math.random().toString(36).substring(2, 9),
    bookId,
    sectionId,
    blockId,
    type: 'note',
    noteText,
    selectedText,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.annotations.put(record);
  return record;
}
