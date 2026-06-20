import type {
  Theme,
  CoverProps,
  TitlePageProps,
  ContentPageProps,
  IndexPageProps,
  BlankPageProps,
} from './types';

const colors = {
  paper: '#f3e9d0',
  paperEdge: '#c9b48a',
  ink: '#2a2418',
  inkSoft: '#5a4a35',
  coverPrimary: '#3a241a',
  coverAccent: '#c9a25b',
  coverInk: '#f1dfb5',
};

const fonts = {
  body: '"EB Garamond", "Georgia", serif',
  title: '"Cormorant Garamond", "Georgia", serif',
};

function DiaryCover({ side, bookTitle, bookSubtitle }: CoverProps) {
  return (
    <div className={`diary-cover diary-cover--${side}`}>
      <div className="diary-cover__border">
        {side === 'front' ? (
          <div className="diary-cover__inner">
            <div className="diary-cover__ornament">❦</div>
            <h1 className="diary-cover__title">{bookTitle}</h1>
            {bookSubtitle && (
              <div className="diary-cover__subtitle">{bookSubtitle}</div>
            )}
            <div className="diary-cover__ornament diary-cover__ornament--bottom">❦</div>
          </div>
        ) : (
          <div className="diary-cover__inner">
            <div className="diary-cover__ornament diary-cover__ornament--small">❦</div>
          </div>
        )}
      </div>
    </div>
  );
}

function BackToIndexButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="diary-back-to-index"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      aria-label="Back to index"
    >
      ↩ Index
    </button>
  );
}

function PageFooter({ pageNumber }: { pageNumber: number }) {
  return <div className="diary-page__footer">— {pageNumber} —</div>;
}

function DiaryTitlePage({ poem, diaryPageNumber, onJumpToIndex }: TitlePageProps) {
  return (
    <div className="diary-page diary-page--title">
      <div className="diary-page__paper">
        <div className="diary-title-block">
          <div className="diary-title-block__rule" />
          <h2 className="diary-title-block__title">{poem.title}</h2>
          <div className="diary-title-block__rule" />
        </div>
      </div>
      <BackToIndexButton onClick={onJumpToIndex} />
      <PageFooter pageNumber={diaryPageNumber} />
    </div>
  );
}

function DiaryContentPage({
  lines,
  diaryPageNumber,
  onJumpToIndex,
}: ContentPageProps) {
  return (
    <div className="diary-page diary-page--content">
      <div className="diary-page__paper">
        <div className="diary-body">
          {lines.map((line, i) => (
            <div
              key={i}
              className={
                line.trim() === ''
                  ? 'diary-body__line diary-body__line--blank'
                  : 'diary-body__line'
              }
            >
              {line.trim() === '' ? ' ' : line}
            </div>
          ))}
        </div>
      </div>
      <BackToIndexButton onClick={onJumpToIndex} />
      <PageFooter pageNumber={diaryPageNumber} />
    </div>
  );
}

function DiaryIndexPage({
  entries,
  isFirstPage,
  diaryPageNumber,
  onJumpToEntry,
}: IndexPageProps) {
  return (
    <div className="diary-page diary-page--index">
      <div className="diary-page__paper">
        {isFirstPage && (
          <div className="diary-index__header">
            <h2 className="diary-index__title">Contents</h2>
            <div className="diary-title-block__rule" />
          </div>
        )}
        <div className="diary-index__table">
          <div className="diary-index__row diary-index__row--head">
            <span className="diary-index__col diary-index__col--num">No.</span>
            <span className="diary-index__col diary-index__col--title">Title</span>
            <span className="diary-index__col diary-index__col--page">Page</span>
          </div>
          {entries.map((entry) => (
            <div key={entry.slug} className="diary-index__row">
              <span className="diary-index__col diary-index__col--num">
                {entry.srNo}.
              </span>
              <button
                type="button"
                className="diary-index__col diary-index__col--title diary-index__link"
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToEntry(entry.bookIndex);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {entry.title}
              </button>
              <span className="diary-index__col diary-index__col--page">
                {entry.diaryPageNumber}
              </span>
            </div>
          ))}
        </div>
      </div>
      <PageFooter pageNumber={diaryPageNumber} />
    </div>
  );
}

function DiaryBlankPage({ diaryPageNumber }: BlankPageProps) {
  return (
    <div className="diary-page diary-page--blank">
      <div className="diary-page__paper">
        <div className="diary-blank__ornament">❦</div>
      </div>
      {diaryPageNumber !== undefined && (
        <PageFooter pageNumber={diaryPageNumber} />
      )}
    </div>
  );
}

export const DiaryTheme: Theme = {
  name: 'diary',
  colors,
  fonts,
  bookTitle: 'a song of storms and sunshines',
  bookSubtitle: '🌪️ & ☀️',
  indexTitle: 'Contents',
  Cover: DiaryCover,
  TitlePage: DiaryTitlePage,
  ContentPage: DiaryContentPage,
  IndexPage: DiaryIndexPage,
  BlankPage: DiaryBlankPage,
};
