import type { Poem } from './Poem';

export type Page =
  | { kind: 'cover'; side: 'front' | 'back' }
  | { kind: 'title'; poem: Poem }
  | { kind: 'content'; poem: Poem; lines: string[]; pageOfPoem: number; totalPagesOfPoem: number }
  | { kind: 'blank' };
