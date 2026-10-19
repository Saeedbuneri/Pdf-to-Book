import { db } from './database';
import type { ReadingProgress } from '../types/book';

export async function getProgress(bookId: string): Promise<ReadingProgress | undefined> {
  return await db.progress.get(bookId);
}

export async function saveProgress(progress: ReadingProgress): Promise<void> {
  await db.progress.put(progress);
}

export async function markSectionCompleted(
  bookId: string,
  sectionId: string,
  isCompleted: boolean = true
): Promise<void> {
  const current = await db.progress.get(bookId);
  const completedSections = new Set(current?.completedSections || []);

  if (isCompleted) {
    completedSections.add(sectionId);
  } else {
    completedSections.delete(sectionId);
  }

  await db.progress.put({
    bookId,
    sectionId: current?.sectionId || sectionId,
    blockId: current?.blockId,
    characterOffset: current?.characterOffset,
    scrollPercentage: current?.scrollPercentage,
    completedSections: Array.from(completedSections),
    updatedAt: Date.now(),
  });
}
