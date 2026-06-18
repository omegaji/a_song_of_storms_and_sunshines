import type {
  Theme,
  CoverProps,
  TitlePageProps,
  ContentPageProps,
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

function DiaryTitlePage({ poem }: TitlePageProps) {
  return (
    <div className="diary-page diary-page--title">
      <div className="diary-page__paper">
        <div className="diary-title-block">
          <div className="diary-title-block__rule" />
          <h2 className="diary-title-block__title">{poem.title}</h2>
          <div className="diary-title-block__rule" />
        </div>
      </div>
    </div>
  );
}

function DiaryContentPage({
  lines,
  pageOfPoem,
  totalPagesOfPoem,
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
              {line.trim() === '' ? ' ' : line}
            </div>
          ))}
        </div>
        {totalPagesOfPoem > 1 && (
          <div className="diary-page__footer">
            {pageOfPoem} / {totalPagesOfPoem}
          </div>
        )}
      </div>
    </div>
  );
}

function DiaryBlankPage() {
  return (
    <div className="diary-page diary-page--blank">
      <div className="diary-page__paper" />
    </div>
  );
}

export const DiaryTheme: Theme = {
  name: 'diary',
  colors,
  fonts,
  bookTitle: 'a song of storms and sunshines',
  bookSubtitle: '🌪️ & ☀️',
  Cover: DiaryCover,
  TitlePage: DiaryTitlePage,
  ContentPage: DiaryContentPage,
  BlankPage: DiaryBlankPage,
};
