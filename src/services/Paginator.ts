import type { Poem } from '../models/Poem';
import type { Page, IndexEntry } from '../models/Page';

export interface PageCapacity {
  heightPx: number;
  lineHeightPx: number;
  measure: (line: string) => number;
}

const INDEX_HEADER_HEIGHT_PX = 96;

export class Paginator {
  static splitPoemBody(poem: Poem, cap: PageCapacity): string[][] {
    if (poem.body.length === 0) return [[]];

    const pages: string[][] = [];
    let current: string[] = [];
    let usedHeight = 0;

    const heightOf = (line: string) => Math.max(cap.measure(line), 1);

    for (const line of poem.body) {
      const h = heightOf(line);

      if (usedHeight + h > cap.heightPx && current.length > 0) {
        const blankIdx = lastBlankIndex(current);
        if (blankIdx > 0 && blankIdx < current.length - 1) {
          const carry = current.slice(blankIdx + 1);
          pages.push(stripEdges(current.slice(0, blankIdx)));
          current = carry;
          usedHeight = carry.reduce((s, l) => s + heightOf(l), 0);
        } else {
          pages.push(stripEdges(current));
          current = [];
          usedHeight = 0;
        }
      }

      if (current.length === 0 && line.trim() === '') continue;
      current.push(line);
      usedHeight += h;
    }

    if (current.length > 0) pages.push(stripEdges(current));
    return pages.length > 0 ? pages : [[]];
  }

  static composeBook(poems: Poem[], cap: PageCapacity): Page[] {
    // Phase 1: estimate index page count (deterministic from poem count).
    const indexPageCount = computeIndexPageCount(poems.length, cap);

    // Phase 2: build the page skeleton (covers + index placeholders + poems).
    const pages: Page[] = [];
    pages.push({ kind: 'cover', side: 'front' });

    // Index placeholders — replaced with real index pages after positions are known.
    for (let i = 0; i < indexPageCount; i++) {
      pages.push({
        kind: 'index',
        entries: [],
        isFirstPage: i === 0,
        diaryPageNumber: 0,
      });
    }

    // Pad so the first poem title lands on a LEFT page.
    while (pages.length % 2 === 0) {
      pages.push({ kind: 'blank' });
    }

    const titlePositions = new Map<string, number>();

    for (const poem of poems) {
      while (pages.length % 2 === 0) {
        pages.push({ kind: 'blank' });
      }
      titlePositions.set(poem.slug, pages.length);
      pages.push({ kind: 'title', poem, diaryPageNumber: 0 });

      const bodyPages = Paginator.splitPoemBody(poem, cap);
      bodyPages.forEach((lines, i) => {
        pages.push({
          kind: 'content',
          poem,
          lines,
          pageOfPoem: i + 1,
          totalPagesOfPoem: bodyPages.length,
          diaryPageNumber: 0,
        });
      });
    }

    if (pages.length % 2 === 1) {
      pages.push({ kind: 'blank' });
    }
    pages.push({ kind: 'cover', side: 'back' });

    // Phase 3: assign continuous diary page numbers (skipping covers).
    let diaryPageNumber = 0;
    for (const p of pages) {
      if (p.kind === 'cover') continue;
      diaryPageNumber++;
      (p as { diaryPageNumber?: number }).diaryPageNumber = diaryPageNumber;
    }

    // Phase 4: build real index entries and slot them into the placeholders.
    const entries: IndexEntry[] = poems.map((poem, i) => {
      const bookIndex = titlePositions.get(poem.slug) ?? 0;
      const titlePage = pages[bookIndex] as { diaryPageNumber: number };
      return {
        srNo: i + 1,
        title: poem.title,
        slug: poem.slug,
        diaryPageNumber: titlePage.diaryPageNumber,
        bookIndex,
      };
    });

    const indexPagesContent = paginateIndex(entries, cap);

    // Replace placeholders. If we paginated to fewer pages than reserved,
    // remaining slots stay as empty index pages (rare edge case).
    let ip = 0;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.kind === 'index') {
        const slice = indexPagesContent[ip++];
        if (slice) {
          pages[i] = {
            kind: 'index',
            entries: slice,
            isFirstPage: page.isFirstPage,
            diaryPageNumber: page.diaryPageNumber,
          };
        }
      }
    }

    return pages;
  }
}

function computeIndexPageCount(numEntries: number, cap: PageCapacity): number {
  if (numEntries === 0) return 1;
  const firstPageCapacity = Math.max(
    1,
    Math.floor((cap.heightPx - INDEX_HEADER_HEIGHT_PX) / cap.lineHeightPx),
  );
  const subsequentPageCapacity = Math.max(
    1,
    Math.floor(cap.heightPx / cap.lineHeightPx),
  );
  if (numEntries <= firstPageCapacity) return 1;
  const remaining = numEntries - firstPageCapacity;
  return 1 + Math.ceil(remaining / subsequentPageCapacity);
}

function paginateIndex(entries: IndexEntry[], cap: PageCapacity): IndexEntry[][] {
  if (entries.length === 0) return [[]];
  const pages: IndexEntry[][] = [];
  const firstPageCapacity = Math.max(
    1,
    Math.floor((cap.heightPx - INDEX_HEADER_HEIGHT_PX) / cap.lineHeightPx),
  );
  const subsequentPageCapacity = Math.max(
    1,
    Math.floor(cap.heightPx / cap.lineHeightPx),
  );
  let cursor = 0;
  while (cursor < entries.length) {
    const cap_ = pages.length === 0 ? firstPageCapacity : subsequentPageCapacity;
    pages.push(entries.slice(cursor, cursor + cap_));
    cursor += cap_;
  }
  return pages;
}

function lastBlankIndex(lines: string[]): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '') return i;
  }
  return -1;
}

function stripEdges(lines: string[]): string[] {
  const copy = [...lines];
  while (copy.length && copy[0].trim() === '') copy.shift();
  while (copy.length && copy[copy.length - 1].trim() === '') copy.pop();
  return copy;
}
