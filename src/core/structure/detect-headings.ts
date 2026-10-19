export interface TextItemWithMetrics {
  text: string;
  fontSize: number;
  fontName: string;
  x: number;
  y: number;
  pageNumber: number;
  isBold?: boolean;
  isMono?: boolean;
}

export interface DetectedHeading {
  title: string;
  level: 1 | 2 | 3;
  confidence: number;
  pageNumber: number;
}

const CHAPTER_PATTERNS = [
  /^(chapter|part|module|unit|section|lesson)\s+([0-9ivxlcdm]+|[a-z]+)[\s:.\-–—]+(.+)?$/i,
  /^(\d+\.\d+(\.\d+)?)\s+(.+)$/, // e.g., "1.2 Introduction" or "3.4.1 Details"
  /^(\d+)\s+([A-Z][A-Za-z0-9\s:,\-–—]+)$/, // e.g., "1 Foundations"
];

/**
 * Patterns that look like headings but are really TOC entries.
 * These should NOT be promoted to headings.
 */
const TOC_ENTRY_PATTERN = /\.{3,}|\s{3,}\d+\s*$|\s+\d{1,4}\s*$/;

export function isProbableHeading(
  line: string,
  fontSize: number,
  medianBodySize: number
): { isHeading: boolean; level: 1 | 2 | 3; confidence: number } {
  const trimmed = line.trim();

  // Reject empty or very long lines
  if (!trimmed || trimmed.length > 120) {
    return { isHeading: false, level: 3, confidence: 0 };
  }

  // Reject lines that look like TOC entries (e.g. "Chapter 1 ......... 12")
  if (TOC_ENTRY_PATTERN.test(trimmed)) {
    return { isHeading: false, level: 3, confidence: 0 };
  }

  // Reject lines that are pure numbers (page numbers, list counters)
  if (/^\d+$/.test(trimmed)) {
    return { isHeading: false, level: 3, confidence: 0 };
  }

  // Check explicit chapter/section regex
  for (const pattern of CHAPTER_PATTERNS) {
    if (pattern.test(trimmed)) {
      const isSub = /^\d+\.\d+\.\d+/.test(trimmed);
      const isSec = /^\d+\.\d+/.test(trimmed);
      return {
        isHeading: true,
        level: isSub ? 3 : isSec ? 2 : 1,
        confidence: 0.95,
      };
    }
  }

  // Font-size heuristic relative to median body font
  const sizeRatio = medianBodySize > 0 ? fontSize / medianBodySize : 1;

  if (sizeRatio >= 1.5 && trimmed.length < 80) {
    return { isHeading: true, level: 1, confidence: 0.88 };
  }

  if (sizeRatio >= 1.25 && trimmed.length < 90) {
    return { isHeading: true, level: 2, confidence: 0.82 };
  }

  if (sizeRatio >= 1.15 && trimmed.length < 100) {
    return { isHeading: true, level: 3, confidence: 0.75 };
  }

  // ALL CAPS short line heuristic (only if font size isn't smaller than body)
  if (
    sizeRatio >= 0.9 &&
    trimmed === trimmed.toUpperCase() &&
    trimmed.length >= 4 &&
    trimmed.length <= 50 &&
    /[A-Z]/.test(trimmed) &&
    !trimmed.includes(';') &&
    !trimmed.includes('=') &&
    !trimmed.includes('...')
  ) {
    return { isHeading: true, level: 2, confidence: 0.78 };
  }

  return { isHeading: false, level: 3, confidence: 0 };
}
