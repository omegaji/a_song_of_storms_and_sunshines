import type { Poem } from '../models/Poem';
import type { Page, IndexEntry } from '../models/Page';

export interface PageCapacity {
  heightPx: number;
  lineHeightPx: number;
  measure: (line: string) => number;
  measureIndexRow: (title: string) => number;
}

// Vertical space taken by the "Contents" header block (title + rule + margin) on
// the first index page only. Tweak in tandem with the CSS in theme.css.
const INDEX_CONTENTS_HEADER_PX = 76;
// The per-page "No. | Title | Page" row header. Present on every index page.
const INDEX_TABLE_HEAD_ROW_PX = 30;

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
    // Phase 1: paginate the index using actual row measurements so we know
    // exactly how many index pages to reserve. Page numbers and book indices
    // are filled in afterwards — only titles matter for sizing.
    const tempEntries: IndexEntry[] = poems.map((poem, i) => ({
      srNo: i + 1,
      title: poem.title,
      slug: poem.slug,
      diaryPageNumber: 0,
      bookIndex: 0,
    }));
    const indexGroups = paginateIndex(tempEntries, cap);
    const indexPageCount = indexGroups.length;

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

    // Phase 4: stamp real page numbers / book indices into the index groups
    // we paginated in Phase 1, then slot them into the placeholder pages.
    for (const group of indexGroups) {
      for (const entry of group) {
        const bookIndex = titlePositions.get(entry.slug) ?? 0;
        const titlePage = pages[bookIndex] as { diaryPageNumber: number };
        entry.bookIndex = bookIndex;
        entry.diaryPageNumber = titlePage.diaryPageNumber;
      }
    }

    let ip = 0;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.kind === 'index') {
        const slice = indexGroups[ip++];
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

function paginateIndex(entries: IndexEntry[], cap: PageCapacity): IndexEntry[][] {
  if (entries.length === 0) return [[]];
  const pages: IndexEntry[][] = [];
  let current: IndexEntry[] = [];
  let usedHeight = 0;
  let availableHeight =
    cap.heightPx - INDEX_TABLE_HEAD_ROW_PX - INDEX_CONTENTS_HEADER_PX;

  for (const entry of entries) {
    const h = cap.measureIndexRow(entry.title);
    if (usedHeight + h > availableHeight && current.length > 0) {
      pages.push(current);
      current = [];
      usedHeight = 0;
      availableHeight = cap.heightPx - INDEX_TABLE_HEAD_ROW_PX;
    }
    current.push(entry);
    usedHeight += h;
  }
  if (current.length > 0) pages.push(current);
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
