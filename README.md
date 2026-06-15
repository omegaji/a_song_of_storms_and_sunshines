# Flipbook Poems

A diary-style flipbook website for poems. Built with React + TypeScript + Vite, animated by [react-pageflip](https://github.com/Nodlik/react-pageflip).

- **Add a poem** = drop a `.txt` into `poems/`. No code change.
- **Swap the look** = change one import in `src/App.tsx`.
- **Hosted on GitHub Pages** via the included Actions workflow.

---

## Run locally

Requires Node 16+ (Node 18+ recommended). On Node 16 you'll see one harmless engine warning during install.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://127.0.0.1:5173/flipbook-poem/`).

Other scripts:

```bash
npm run build      # produces dist/
npm run preview    # serves dist/ exactly as GitHub Pages will
```

---

## Add a new poem

Drop a `.txt` file into `poems/` using the pattern `NN-some-slug.txt`:

```
07-a-new-poem.txt
```

Format:

```
Title of the poem

Line one of the body.
Line two.

A blank line is treated as a paragraph break and is preferred
as a page-split point for long poems.
```

- The first non-blank line is the **title** (rendered on a left page).
- Everything after is the **body**, preserving line breaks (rendered on the right page and continuation pages).
- The filename's leading number controls the order.
- Long poems automatically span multiple pages, splitting at blank lines when possible.

Restart `npm run dev` (or rebuild) — the new poem appears in the book.

---

## Swap the look

All visual decisions — cover, page paper, fonts, title layout, content layout — live in `src/themes/`.

To change the look:

1. Copy `src/themes/DiaryTheme.tsx` to something like `LeatherTheme.tsx`.
2. Change colors, fonts, and the `Cover` / `TitlePage` / `ContentPage` components however you like (each is just a React component receiving the data it needs).
3. In `src/App.tsx`, change the single import:

```tsx
// before
import { DiaryTheme } from './themes/DiaryTheme';
// after
import { LeatherTheme as DiaryTheme } from './themes/LeatherTheme';
```

The `Theme` interface in `src/themes/types.ts` is the contract.

---

## Deploy to GitHub Pages

The repo includes `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages on every push to `main`.

### One-time setup

1. **Push the repo to GitHub** (the directory name `flipbook-poem` is assumed to be the repo name — see "Renaming the repo" below if it differs).

2. **Enable GitHub Pages with the Actions source**:
   - Go to **Settings → Pages** on your repo.
   - Under **Build and deployment → Source**, choose **GitHub Actions**.

3. **Verify permissions**:
   - **Settings → Actions → General → Workflow permissions** must allow the workflow to write to the repo (`Read and write permissions`) — required so the action can publish the Pages artifact.

### Deploying

```bash
git add .
git commit -m "publish"
git push origin main
```

The workflow runs on push: installs deps, builds, and deploys. Live URL prints in the Actions run summary, typically:

```
https://<your-github-username>.github.io/flipbook-poem/
```

You can also trigger the workflow manually from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

### Renaming the repo

If your repo isn't named `flipbook-poem`, update `vite.config.ts`:

```ts
export default defineConfig({
  base: '/<your-repo-name>/',   // must match the GitHub Pages path
  plugins: [react()],
});
```

For a **user/organization site** (repo named `<user>.github.io`), set `base: '/'`.

### Custom domain

Add a `public/CNAME` file containing your domain (e.g. `poems.example.com`), set `base: '/'` in `vite.config.ts`, and configure the domain in **Settings → Pages → Custom domain**.

---

## Project structure

```
flipbook-poem/
├── poems/                          ← drop new .txt files here
├── src/
│   ├── models/         Poem, Page (domain types)
│   ├── services/       PoemLoader (auto-glob), Paginator (split + compose)
│   ├── themes/         Theme interface + DiaryTheme
│   ├── components/     Flipbook (wraps react-pageflip)
│   ├── styles/         base.css + theme.css
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── .github/workflows/deploy.yml
```
