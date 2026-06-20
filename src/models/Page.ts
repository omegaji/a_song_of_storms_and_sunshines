import type { Poem } from './Poem';

export interface IndexEntry {
  srNo: number;
  title: string;
  slug: string;
  diaryPageNumber: number;
  bookIndex: number;
}

export type Page =
  | { kind: 'cover'; side: 'front' | 'back' }
  | { kind: 'title'; poem: Poem; diaryPageNumber: number }
  | {
      kind: 'content';
      poem: Poem;
      lines: string[];
      pageOfPoem: number;
      totalPagesOfPoem: number;
      diaryPageNumber: number;
    }
  | {
      kind: 'index';
      entries: IndexEntry[];
      isFirstPage: boolean;
      diaryPageNumber: number;
    }
  | { kind: 'blank'; diaryPageNumber?: number };
