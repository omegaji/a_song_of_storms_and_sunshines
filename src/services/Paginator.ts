import type { Poem } from '../models/Poem';
import type { Page } from '../models/Page';

export interface PageCapacity {
  heightPx: number;
  measure: (line: string) => number;
}

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
    const pages: Page[] = [{ kind: 'cover', side: 'front' }];

    for (const poem of poems) {
      // Title must land on a LEFT page. With showCover, index 0 is the front
      // cover (alone). Index 1 onwards: odd = left, even = right.
      while (pages.length % 2 === 0) {
        pages.push({ kind: 'blank' });
      }
      pages.push({ kind: 'title', poem });

      const bodyPages = Paginator.splitPoemBody(poem, cap);
      bodyPages.forEach((lines, i) => {
        pages.push({
          kind: 'content',
          poem,
          lines,
          pageOfPoem: i + 1,
          totalPagesOfPoem: bodyPages.length,
        });
      });
    }

    if (pages.length % 2 === 1) {
      pages.push({ kind: 'blank' });
    }
    pages.push({ kind: 'cover', side: 'back' });
    return pages;
  }
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
