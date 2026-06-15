import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from './types';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  const cssVars = useMemo(
    () =>
      ({
        '--paper': theme.colors.paper,
        '--paper-edge': theme.colors.paperEdge,
        '--ink': theme.colors.ink,
        '--ink-soft': theme.colors.inkSoft,
        '--cover-primary': theme.colors.coverPrimary,
        '--cover-accent': theme.colors.coverAccent,
        '--cover-ink': theme.colors.coverInk,
        '--font-body': theme.fonts.body,
        '--font-title': theme.fonts.title,
      }) as React.CSSProperties,
    [theme],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <div className="theme-root" style={cssVars}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside ThemeProvider');
  return t;
}
