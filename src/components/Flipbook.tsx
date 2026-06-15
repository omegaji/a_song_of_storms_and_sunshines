import { useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { Poem } from '../models/Poem';
import type { Page } from '../models/Page';
import { Paginator } from '../services/Paginator';
import type { PageCapacity } from '../services/Paginator';
import { useTheme } from '../themes/ThemeContext';

interface Dimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

function calcDims(): Dimensions {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 768;
  if (isMobile) {
    const w = Math.min(vw * 0.92, 420);
    const h = Math.min(vh * 0.85, w * 1.45);
    return { width: Math.floor(w), height: Math.floor(h), isMobile };
  }
  // Landscape (two-page) spread: total book width ~ 70% of viewport, capped.
  const totalBookWidth = Math.min(vw * 0.72, 1100);
  const w = Math.floor(totalBookWidth / 2);
  const h = Math.min(vh * 0.9, w * 1.5);
  return { width: w, height: Math.floor(h), isMobile };
}

const PAGE_PADDING_X_DESKTOP = 38;
const PAGE_PADDING_Y_DESKTOP = 56;
const PAGE_PADDING_X_MOBILE = 24;
const PAGE_PADDING_Y_MOBILE = 44;
const FONT_SIZE_DESKTOP = 20;
const FONT_SIZE_MOBILE = 18;
const LINE_HEIGHT_DESKTOP = 34;
const LINE_HEIGHT_MOBILE = 30;

export function Flipbook({ poems }: { poems: Poem[] }) {
  const theme = useTheme();
  const [dims, setDims] = useState<Dimensions>(calcDims);
  const [pages, setPages] = useState<Page[]>([]);
  const [fontsReady, setFontsReady] = useState(false);
  const measurerRef = useRef<HTMLDivElement | null>(null);

  const padX = dims.isMobile ? PAGE_PADDING_X_MOBILE : PAGE_PADDING_X_DESKTOP;
  const padY = dims.isMobile ? PAGE_PADDING_Y_MOBILE : PAGE_PADDING_Y_DESKTOP;
  const fontSizePx = dims.isMobile ? FONT_SIZE_MOBILE : FONT_SIZE_DESKTOP;
  const lineHeightPx = dims.isMobile ? LINE_HEIGHT_MOBILE : LINE_HEIGHT_DESKTOP;

  useEffect(() => {
    const onResize = () => setDims(calcDims());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      setFontsReady(true);
      return;
    }
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    if (!fontsReady) return;
    const node = measurerRef.current;
    if (!node) return;

    // Reserve a little extra for the page-number footer.
    const availableHeight = dims.height - padY * 2 - 24;

    const measure = (line: string): number => {
      node.textContent = line.trim() === '' ? ' ' : line;
      return node.offsetHeight;
    };

    const cap: PageCapacity = { heightPx: availableHeight, measure };
    setPages(Paginator.composeBook(poems, cap));
  }, [poems, dims, fontsReady, padY]);

  const measurerStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      visibility: 'hidden' as const,
      pointerEvents: 'none' as const,
      left: -99999,
      top: 0,
      width: dims.width - padX * 2,
      fontFamily: theme.fonts.body,
      fontSize: `${fontSizePx}px`,
      lineHeight: `${lineHeightPx}px`,
      textAlign: 'center' as const,
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
    }),
    [dims.width, padX, fontSizePx, lineHeightPx, theme.fonts.body],
  );

  const themeVars = useMemo(
    () =>
      ({
        '--page-pad-x': `${padX}px`,
        '--page-pad-y': `${padY}px`,
        '--body-size': `${fontSizePx}px`,
        '--line-h': `${lineHeightPx}px`,
      }) as React.CSSProperties,
    [padX, padY, fontSizePx, lineHeightPx],
  );

  return (
    <div className="book-stage" style={themeVars}>
      <div ref={measurerRef} style={measurerStyle} aria-hidden />
      {pages.length > 0 && (
        <BookView pages={pages} dims={dims} key={`${dims.width}x${dims.height}`} />
      )}
    </div>
  );
}

function BookView({ pages, dims }: { pages: Page[]; dims: Dimensions }) {
  const theme = useTheme();
  const { Cover, TitlePage, ContentPage, BlankPage } = theme;

  return (
    <HTMLFlipBook
      width={dims.width}
      height={dims.height}
      size="fixed"
      minWidth={260}
      maxWidth={700}
      minHeight={360}
      maxHeight={1000}
      showCover
      usePortrait={dims.isMobile}
      mobileScrollSupport
      drawShadow
      maxShadowOpacity={0.4}
      flippingTime={700}
      className="flipbook"
      style={{}}
      startPage={0}
      startZIndex={0}
      autoSize={false}
      clickEventForward
      useMouseEvents
      swipeDistance={30}
      showPageCorners
      disableFlipByClick={false}
    >
      {pages.map((p, idx) => {
        const isCover = p.kind === 'cover';
        return (
          <div
            key={idx}
            className={`page-wrap${isCover ? ' page-wrap--hard' : ''}`}
            data-density={isCover ? 'hard' : undefined}
          >
            {p.kind === 'cover' && (
              <Cover
                side={p.side}
                bookTitle={theme.bookTitle}
                bookSubtitle={theme.bookSubtitle}
              />
            )}
            {p.kind === 'title' && <TitlePage poem={p.poem} />}
            {p.kind === 'content' && (
              <ContentPage
                poem={p.poem}
                lines={p.lines}
                pageOfPoem={p.pageOfPoem}
                totalPagesOfPoem={p.totalPagesOfPoem}
              />
            )}
            {p.kind === 'blank' && <BlankPage />}
          </div>
        );
      })}
    </HTMLFlipBook>
  );
}
