import { useMemo } from 'react';
import { PoemLoader } from './services/PoemLoader';
import { Flipbook } from './components/Flipbook';
import { ThemeProvider } from './themes/ThemeContext';
import { DiaryTheme } from './themes/DiaryTheme';

export function App() {
  const poems = useMemo(() => PoemLoader.loadAll(), []);

  return (
    <ThemeProvider theme={DiaryTheme}>
      <main className="app-shell">
        <Flipbook poems={poems} />
      </main>
    </ThemeProvider>
  );
}
