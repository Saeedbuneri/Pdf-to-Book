import { db } from '../../storage/database';
import type { SearchResult, ContentBlock, BookSection } from '../../types/book';

export async function searchInBook(
  bookId: string,
  query: string,
  sections: BookSection[],
  blocks?: ContentBlock[]
): Promise<SearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  const sectionMap = new Map(sections.map(s => [s.id, s.title]));
  const results: SearchResult[] = [];

  // If memory blocks are provided, search them directly for fastest response
  if (blocks && blocks.length > 0) {
    for (const b of blocks) {
      if (!b.text) continue;
      const lower = b.text.toLowerCase();
      const matchIndex = lower.indexOf(trimmed);
      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(b.text.length, matchIndex + trimmed.length + 40);
        const snippet = (start > 0 ? '...' : '') +
          b.text.substring(start, end) +
          (end < b.text.length ? '...' : '');

        results.push({
          blockId: b.id,
          sectionId: b.sectionId,
          sectionTitle: sectionMap.get(b.sectionId) || 'Chapter Section',
          sourcePage: b.sourcePages?.[0] || 1,
          matchText: b.text.substring(matchIndex, matchIndex + trimmed.length),
          surroundingSnippet: snippet,
        });

        if (results.length >= 40) break;
      }
    }
    return results;
  }

  // Fallback to IndexedDB search index across entire book
  const entries = await db.searchIndex
    .where('bookId')
    .equals(bookId)
    .filter(entry => entry.content.includes(trimmed))
    .limit(40)
    .toArray();

  if (entries.length === 0) return [];

  // Batch-fetch all matching blocks in a single bulk operation instead of N serial queries
  const blockIds = entries.map(e => e.blockId);
  const fetchedBlocks = await db.blocks.bulkGet(blockIds);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const block = fetchedBlocks[i];
    if (!block || !block.text) continue;

    const lower = block.text.toLowerCase();
    const matchIndex = lower.indexOf(trimmed);
    // Guard against mismatch or stale index
    if (matchIndex === -1) continue;

    const start = Math.max(0, matchIndex - 40);
    const end = Math.min(block.text.length, matchIndex + trimmed.length + 40);
    const snippet = (start > 0 ? '...' : '') +
      block.text.substring(start, end) +
      (end < block.text.length ? '...' : '');

    results.push({
      blockId: block.id,
      sectionId: block.sectionId,
      sectionTitle: sectionMap.get(block.sectionId) || 'Chapter Section',
      sourcePage: block.sourcePages?.[0] || entry.sourcePage || 1,
      matchText: block.text.substring(matchIndex, matchIndex + trimmed.length),
      surroundingSnippet: snippet,
    });
  }

  return results;
}
