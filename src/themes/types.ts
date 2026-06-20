import type { ComponentType } from 'react';
import type { Poem } from '../models/Poem';
import type { IndexEntry } from '../models/Page';

export interface ThemeColors {
  paper: string;
  paperEdge: string;
  ink: string;
  inkSoft: string;
  coverPrimary: string;
  coverAccent: string;
  coverInk: string;
}

export interface ThemeFonts {
  body: string;
  title: string;
}

export interface CoverProps {
  side: 'front' | 'back';
  bookTitle: string;
  bookSubtitle?: string;
}

export interface TitlePageProps {
  poem: Poem;
  diaryPageNumber: number;
  onJumpToIndex: () => void;
}

export interface ContentPageProps {
  poem: Poem;
  lines: string[];
  pageOfPoem: number;
  totalPagesOfPoem: number;
  diaryPageNumber: number;
  onJumpToIndex: () => void;
}

export interface IndexPageProps {
  entries: IndexEntry[];
  isFirstPage: boolean;
  diaryPageNumber: number;
  onJumpToEntry: (bookIndex: number) => void;
}

export interface BlankPageProps {
  diaryPageNumber?: number;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  bookTitle: string;
  bookSubtitle?: string;
  indexTitle: string;
  Cover: ComponentType<CoverProps>;
  TitlePage: ComponentType<TitlePageProps>;
  ContentPage: ComponentType<ContentPageProps>;
  IndexPage: ComponentType<IndexPageProps>;
  BlankPage: ComponentType<BlankPageProps>;
}
