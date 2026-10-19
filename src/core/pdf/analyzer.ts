import type * as pdfjsLib from 'pdfjs-dist';
import type { BookRecord, BookSection, ContentBlock, BookGenre } from '../../types/book';
import { isProbableHeading } from '../structure/detect-headings';
import { extractPdfMetadata } from './pdf-loader';
import type { PdfOutlineItem } from './pdf-loader';
import { saveBlocks, saveSections, updateBook } from '../../storage/book-store';

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  statusText: string;
  firstChapterReady: boolean;
}

// ─── TOC / front-matter detection helpers ────────────────────────────────────

/** Titles that indicate a front-matter / navigational page, NOT real content. */
const FRONT_MATTER_TITLES = new Set([
  'table of contents',
  'contents',
  'toc',
  'index',
  'preface',
  'foreword',
  'acknowledgements',
  'acknowledgments',
  'list of figures',
  'list of tables',
  'bibliography',
  'references',
  'glossary',
  'appendix',
  'about the author',
  'copyright',
  'dedication',
]);

function isFrontMatterTitle(title: string): boolean {
  return FRONT_MATTER_TITLES.has(title.toLowerCase().trim());
}

/**
 * Flatten the nested PDF outline into a sorted list of (pageIndex, title, level) entries.
 * Skips TOC / front-matter entries so they don't become "chapters".
 */
interface FlatOutlineEntry {
  title: string;
  pageIndex: number; // 1-based
  level: number;     // 1 = top-level chapter, 2 = section, 3 = sub-section
}

function flattenOutline(items: PdfOutlineItem[], level = 1): FlatOutlineEntry[] {
  const result: FlatOutlineEntry[] = [];
  for (const item of items) {
    if (item.pageIndex !== undefined && !isFrontMatterTitle(item.title)) {
      result.push({ title: item.title, pageIndex: item.pageIndex, level });
    }
    if (item.items && item.items.length > 0) {
      result.push(...flattenOutline(item.items, Math.min(level + 1, 3)));
    }
  }
  // Sort by page so we can do a simple page-range lookup
  result.sort((a, b) => a.pageIndex - b.pageIndex);
  return result;
}

// ─── Main analyzer class ──────────────────────────────────────────────────────

export class PdfBookAnalyzer {
  private isCancelled = false;

  public cancel(): void {
    this.isCancelled = true;
  }

  public async analyzeBook(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    book: BookRecord,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<{
    sections: BookSection[];
    blocks: ContentBlock[];
    genre: BookGenre;
    isScanned: boolean;
  }> {
    this.isCancelled = false;
    const totalPages = pdfDoc.numPages;

    onProgress?.({
      currentPage: 0,
      totalPages,
      percentage: 5,
      statusText: 'Reading PDF metadata and document outline...',
      firstChapterReady: false,
    });

    const meta = await extractPdfMetadata(pdfDoc);

    // Flatten the full nested outline (skipping TOC entries)
    const flatOutline = flattenOutline(meta.outline || []);

    // Sample font metrics from the body of the book in parallel
    const { medianFontSize, initialTextCount } = await this.sampleFontMetrics(pdfDoc);

    if (initialTextCount < 30 && totalPages > 1) {
      return { sections: [], blocks: [], genre: 'general', isScanned: true };
    }

    const sections: BookSection[] = [];
    const allBlocks: ContentBlock[] = [];
    let currentSection: BookSection | null = null;
    let sectionCounter = 1;
    let blockCounter = 1;

    // Set of sections touched in the current batch to avoid O(N²) bulkPut rewrites
    const dirtySections = new Set<BookSection>();

    let codeBlockCount = 0;
    let mathBlockCount = 0;

    const BATCH_SIZE = 4;
    let firstChapterReported = false;

    const nextBlockId = () =>
      `blk_${book.id}_${blockCounter++}_${Date.now().toString(36)}`;

    // Helper to start a new section
    const startNewSection = (title: string, level: number, page: number): BookSection => {
      const newSec: BookSection = {
        id: `sec_${book.id}_${sectionCounter++}`,
        bookId: book.id,
        title: title.trim(),
        level,
        order: sections.length + 1,
        blockIds: [],
        childSectionIds: [],
        pageStart: page,
        pageEnd: page,
      };
      sections.push(newSec);
      currentSection = newSec;
      dirtySections.add(newSec);
      return newSec;
    };

    // Initialize with either the first real chapter from the outline or a generic section
    if (flatOutline.length > 0) {
      currentSection = startNewSection(flatOutline[0].title, flatOutline[0].level, flatOutline[0].pageIndex);
    } else {
      currentSection = startNewSection(meta.title || 'Content', 1, 1);
    }

    // Build a fast page→outline-entry map for O(1) look-ups
    const outlineByPage = new Map<number, FlatOutlineEntry>();
    for (const entry of flatOutline) {
      if (!outlineByPage.has(entry.pageIndex)) {
        outlineByPage.set(entry.pageIndex, entry);
      }
    }

    for (let pageNum = 1; pageNum <= totalPages; pageNum += BATCH_SIZE) {
      if (this.isCancelled) break;

      const endBatch = Math.min(pageNum + BATCH_SIZE - 1, totalPages);
      const batchBlocks: ContentBlock[] = [];

      for (let p = pageNum; p <= endBatch; p++) {
        if (this.isCancelled) break;

        let items: any[] = [];
        try {
          const page = await pdfDoc.getPage(p);
          const textContent = await page.getTextContent();
          items = textContent.items as any[];
        } catch (pageErr) {
          console.warn(`Failed to extract text from page ${p}, continuing:`, pageErr);
          continue;
        }

        // ── Outline-driven section boundary ──────────────────────────────────
        const outlineEntry = outlineByPage.get(p);
        if (outlineEntry && outlineEntry.title !== currentSection?.title) {
          startNewSection(outlineEntry.title, outlineEntry.level, p);
        }

        // ── Group text items into visual lines (O(N) bucketed) ────────────────
        const lines = this.groupItemsIntoLines(items);

        // ── Skip pages that look like a Table of Contents ─────────────────────
        if (this.looksLikeTocPage(lines)) {
          if (currentSection) {
            currentSection.pageEnd = p;
            dirtySections.add(currentSection);
          }
          continue;
        }

        let activeCodeLines: string[] = [];
        let activeParagraph = '';

        const flushCodeBlock = () => {
          if (activeCodeLines.length > 0 && currentSection) {
            const blockId = nextBlockId();
            const codeBlock: ContentBlock = {
              id: blockId,
              bookId: book.id,
              sectionId: currentSection.id,
              type: 'code',
              text: activeCodeLines.join('\n'),
              language: this.guessCodeLanguage(activeCodeLines.join('\n')),
              sourcePages: [p],
              confidence: 0.9,
            };
            batchBlocks.push(codeBlock);
            allBlocks.push(codeBlock);
            currentSection.blockIds.push(blockId);
            dirtySections.add(currentSection);
            activeCodeLines = [];
            codeBlockCount++;
          }
        };

        const flushParagraph = () => {
          if (activeParagraph.trim().length > 0 && currentSection) {
            const text = activeParagraph.trim();
            const blockId = nextBlockId();

            if (this.isCallout(text)) {
              const calloutBlock: ContentBlock = {
                id: blockId,
                bookId: book.id,
                sectionId: currentSection.id,
                type: 'callout',
                text,
                sourcePages: [p],
                confidence: 0.9,
              };
              batchBlocks.push(calloutBlock);
              allBlocks.push(calloutBlock);
              currentSection.blockIds.push(blockId);
              dirtySections.add(currentSection);
            } else if (this.isMathFormula(text)) {
              const mathBlock: ContentBlock = {
                id: blockId,
                bookId: book.id,
                sectionId: currentSection.id,
                type: 'math',
                mathLatex: this.cleanMathLatex(text),
                text,
                sourcePages: [p],
                confidence: 0.85,
              };
              batchBlocks.push(mathBlock);
              allBlocks.push(mathBlock);
              currentSection.blockIds.push(blockId);
              dirtySections.add(currentSection);
              mathBlockCount++;
            } else {
              const paraBlock: ContentBlock = {
                id: blockId,
                bookId: book.id,
                sectionId: currentSection.id,
                type: 'paragraph',
                text,
                sourcePages: [p],
                confidence: 0.95,
              };
              batchBlocks.push(paraBlock);
              allBlocks.push(paraBlock);
              currentSection.blockIds.push(blockId);
              dirtySections.add(currentSection);
            }
            activeParagraph = '';
          }
        };

        for (const line of lines) {
          const lineText = line.text.trim();
          if (!lineText) continue;

          // Skip very short lines that are likely page numbers or decorators
          if (lineText.length <= 2 && /^[\d\-–—.·•]+$/.test(lineText)) continue;

          // Check if code line
          if (this.isCodeLine(lineText, line.isMono)) {
            flushParagraph();
            activeCodeLines.push(line.text);
            continue;
          } else {
            flushCodeBlock();
          }

          // Check if Heading
          const headingCheck = isProbableHeading(lineText, line.fontSize, medianFontSize);
          if (headingCheck.isHeading && headingCheck.confidence >= 0.75) {
            flushParagraph();

            // Only start a new section from heuristic headings if outline gave no structure
            const shouldStartNewSection =
              headingCheck.level <= 2 &&
              (currentSection?.blockIds.length || 0) > 1 &&
              flatOutline.length === 0;

            if (shouldStartNewSection) {
              startNewSection(lineText, headingCheck.level, p);
            }

            const blockId = nextBlockId();
            const headingBlock: ContentBlock = {
              id: blockId,
              bookId: book.id,
              sectionId: currentSection!.id,
              type: 'heading',
              text: lineText,
              level: headingCheck.level,
              sourcePages: [p],
              confidence: headingCheck.confidence,
            };
            batchBlocks.push(headingBlock);
            allBlocks.push(headingBlock);
            currentSection!.blockIds.push(blockId);
            dirtySections.add(currentSection!);
            continue;
          }

          // ── Regular prose ─────────────────────────────────────────────────
          if (activeParagraph.length > 0) {
            const prev = activeParagraph.trim();
            const prevEndsHard = /[.!?]$/.test(prev);
            const nextStartsCap = /^[A-Z]/.test(lineText);
            const nextIsLong = lineText.length > 40;

            if (prevEndsHard && nextStartsCap && nextIsLong) {
              flushParagraph();
              activeParagraph = lineText;
            } else {
              if (prev.endsWith('-')) {
                activeParagraph = prev.slice(0, -1) + lineText;
              } else {
                activeParagraph += ' ' + lineText;
              }
            }
          } else {
            activeParagraph = lineText;
          }
        }

        flushCodeBlock();
        flushParagraph();

        if (currentSection) {
          currentSection.pageEnd = p;
          dirtySections.add(currentSection);
        }
      }

      // Save intermediate batch to database: only newly created blocks and dirty sections
      if (batchBlocks.length > 0 || dirtySections.size > 0) {
        if (batchBlocks.length > 0) {
          await saveBlocks(batchBlocks);
        }
        if (dirtySections.size > 0) {
          await saveSections(Array.from(dirtySections));
          dirtySections.clear();
        }
        await updateBook(book.id, {
          lastProcessedPage: endBatch,
          processingStatus: endBatch >= totalPages ? 'ready' : 'partial',
        });
      }

      const percentage = Math.round(10 + ((endBatch / totalPages) * 90));
      if (!firstChapterReported && (allBlocks.length > 3 || endBatch >= 3)) {
        firstChapterReported = true;
      }

      onProgress?.({
        currentPage: endBatch,
        totalPages,
        percentage,
        statusText: `Processed page ${endBatch} of ${totalPages}...`,
        firstChapterReady: firstChapterReported,
      });
    }

    // Determine genre based on block distributions
    let genre: BookGenre = 'prose';
    if (codeBlockCount >= 3) {
      genre = 'programming';
    } else if (mathBlockCount >= 3) {
      genre = 'math-science';
    }

    await updateBook(book.id, {
      genre,
      processingStatus: 'ready',
      lastProcessedPage: totalPages,
      confidenceSummary: {
        headingsCount: sections.length,
        codeCount: codeBlockCount,
        mathCount: mathBlockCount,
        totalBlocks: allBlocks.length,
      },
    });

    return { sections, blocks: allBlocks, genre, isScanned: false };
  }

  // ─── Font metrics sampling ─────────────────────────────────────────────────

  /**
   * Sample font sizes from the body of the book in parallel, skipping cover/TOC pages.
   */
  private async sampleFontMetrics(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<{
    medianFontSize: number;
    initialTextCount: number;
  }> {
    const total = pdfDoc.numPages;
    const startPage = Math.min(Math.max(4, Math.floor(total * 0.1)), total);
    const samplePages = Math.min(6, total - startPage + 1);
    const fontSizes: number[] = [];
    let totalText = 0;

    // Fetch pages in parallel for much faster sampling
    const pageNumbers: number[] = [];
    for (let p = startPage; p < startPage + samplePages; p++) {
      pageNumbers.push(p);
    }

    const pageResults = await Promise.all(
      pageNumbers.map(async p => {
        try {
          const page = await pdfDoc.getPage(p);
          const content = await page.getTextContent();
          return content.items as any[];
        } catch {
          return [];
        }
      })
    );

    for (const items of pageResults) {
      for (const item of items) {
        if (item.str && item.str.trim()) {
          totalText += item.str.trim().length;
          const size = item.height > 0 ? item.height : Math.abs(item.transform?.[0] || 12);
          if (size > 5 && size < 72) {
            fontSizes.push(size);
          }
        }
      }
    }

    // Check first pages if no text was found (to detect scanned PDFs)
    if (totalText === 0) {
      const firstPages = [];
      for (let p = 1; p <= Math.min(3, total); p++) {
        firstPages.push(p);
      }
      const initialResults = await Promise.all(
        firstPages.map(async p => {
          try {
            const page = await pdfDoc.getPage(p);
            const content = await page.getTextContent();
            return content.items as any[];
          } catch {
            return [];
          }
        })
      );
      for (const items of initialResults) {
        for (const item of items) {
          if (item.str && item.str.trim()) totalText += item.str.trim().length;
        }
      }
    }

    fontSizes.sort((a, b) => a - b);
    const median = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 12;

    return { medianFontSize: median, initialTextCount: totalText };
  }

  // ─── Line grouping (O(N) with Y-bucketed search) ───────────────────────────

  private groupItemsIntoLines(items: any[]): {
    text: string;
    fontSize: number;
    fontName: string;
    isMono: boolean;
  }[] {
    interface InternalLine {
      y: number;
      fontSize: number;
      fontName: string;
      isMono: boolean;
      items: { x: number; str: string; width: number }[];
    }

    const lines: InternalLine[] = [];
    const Y_TOLERANCE = 3.5;
    const bucketMap = new Map<number, InternalLine>();

    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;
      const x = item.transform[4] ?? 0;
      const y = item.transform[5] ?? 0;
      const fontSize = item.height > 0 ? item.height : Math.abs(item.transform?.[0] || 12);
      const fontName = (item.fontName || '').toLowerCase();
      const isMono =
        fontName.includes('mono') ||
        fontName.includes('courier') ||
        fontName.includes('consolas') ||
        fontName.includes('code');
      const width = item.width ?? 0;

      // O(1) bucket-based lookup instead of O(N) array search
      const bucket = Math.round(y / Y_TOLERANCE);
      let line: InternalLine | undefined = bucketMap.get(bucket);

      if (!line) {
        const prev = bucketMap.get(bucket - 1);
        if (prev && Math.abs(prev.y - y) <= Y_TOLERANCE) {
          line = prev;
        } else {
          const next = bucketMap.get(bucket + 1);
          if (next && Math.abs(next.y - y) <= Y_TOLERANCE) {
            line = next;
          }
        }
      }

      if (!line) {
        line = { y, fontSize, fontName, isMono, items: [] };
        lines.push(line);
        bucketMap.set(bucket, line);
      }
      line.items.push({ x, str: item.str, width });
    }

    // Sort lines top-to-bottom
    lines.sort((a, b) => b.y - a.y);

    return lines.map(line => {
      // Sort left-to-right
      line.items.sort((a, b) => a.x - b.x);

      let text = '';
      for (let i = 0; i < line.items.length; i++) {
        const cur = line.items[i];
        if (i === 0) {
          text = cur.str;
        } else {
          const prev = line.items[i - 1];
          const gap = cur.x - (prev.x + prev.width);
          if (gap > 1) {
            text += ' ' + cur.str;
          } else {
            text += cur.str;
          }
        }
      }

      return {
        text,
        fontSize: line.fontSize,
        fontName: line.fontName,
        isMono: line.isMono,
      };
    });
  }

  // ─── TOC page detection ────────────────────────────────────────────────────

  private looksLikeTocPage(lines: { text: string }[]): boolean {
    if (lines.length < 3) return false;
    const DOT_LEADER = /\.{3,}|[-–—]{3,}|\s{3,}\d+\s*$/;
    const ENDS_WITH_PAGENUM = /\s+\d{1,4}\s*$/;
    let matches = 0;
    for (const l of lines) {
      if (DOT_LEADER.test(l.text) || ENDS_WITH_PAGENUM.test(l.text)) {
        matches++;
      }
    }
    return matches / lines.length > 0.4;
  }

  // ─── Code detection ────────────────────────────────────────────────────────

  private isCodeLine(line: string, isMono?: boolean): boolean {
    if (isMono) return true;
    const trimmed = line.trim();
    const CODE_PATTERNS = [
      /^(import|export)\s+.+\s+from\s+['"].+['"];?$/,
      /^(const|let|var)\s+[a-zA-Z0-9_$]+\s*=/,
      /^function(\s+[a-zA-Z0-9_$]+)?\s*\(.*\)\s*\{?$/,
      /^class\s+[a-zA-Z0-9_$]+(\s+extends\s+[a-zA-Z0-9_$]+)?\s*\{?$/,
      /^public\s+(static\s+)?(void|int|string|boolean|class)/,
      /^def\s+[a-zA-Z0-9_]+\(.*\):$/,
      /^(return|yield|await)\s+.+;?$/,
      /^\s*(\{|\}|\[|\]|\/\/|\/\*|\*\/)\s*$/,
      /^<[a-zA-Z0-9_-]+(\s+[^>]+)?>.*<\/[a-zA-Z0-9_-]+>$/,
    ];
    return CODE_PATTERNS.some(p => p.test(trimmed));
  }

  private guessCodeLanguage(code: string): string {
    if (code.includes('def ') || code.includes('import numpy') || code.includes('print(')) return 'python';
    if (code.includes('interface ') || code.includes('type ') || code.includes(': string')) return 'typescript';
    if (code.includes('SELECT ') || code.includes('FROM ') || code.includes('WHERE ')) return 'sql';
    if (code.includes('public static void') || code.includes('System.out.println')) return 'java';
    if (code.includes('<div') || code.includes('className=')) return 'tsx';
    return 'javascript';
  }

  // ─── Block type helpers ────────────────────────────────────────────────────

  private isCallout(text: string): boolean {
    const trimmed = text.trim();
    const CALLOUT_STARTS = ['note:', 'important:', 'warning:', 'tip:', 'caution:', 'definition:', 'key concept:'];
    return CALLOUT_STARTS.some(prefix => trimmed.toLowerCase().startsWith(prefix)) || trimmed.startsWith('> ');
  }

  private isMathFormula(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length > 200) return false;
    const MATH_INDICATORS = [
      '\\frac', '\\sum', '\\int', '\\sqrt', '\\alpha', '\\beta', '\\gamma',
      '\\theta', '\\partial', '\\infty', '\\times', '\\pm', 'e^{', 'x^2', 'f(x) =',
    ];
    return (
      MATH_INDICATORS.some(ind => trimmed.includes(ind)) ||
      (/^[a-zA-Z]\([a-zA-Z0-9,\s]+\)\s*=/.test(trimmed) && trimmed.length < 60)
    );
  }

  private cleanMathLatex(text: string): string {
    return text.replace(/^\$+|\$+$/g, '').trim();
  }
}
