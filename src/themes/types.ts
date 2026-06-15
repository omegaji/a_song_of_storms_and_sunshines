import type { ComponentType } from 'react';
import type { Poem } from '../models/Poem';

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
}

export interface ContentPageProps {
  poem: Poem;
  lines: string[];
  pageOfPoem: number;
  totalPagesOfPoem: number;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  bookTitle: string;
  bookSubtitle?: string;
  Cover: ComponentType<CoverProps>;
  TitlePage: ComponentType<TitlePageProps>;
  ContentPage: ComponentType<ContentPageProps>;
  BlankPage: ComponentType;
}
