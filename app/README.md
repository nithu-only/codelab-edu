# CodeLab Edu

A lightweight programming-education web app: an **Online IDE** plus a **Learn & Practice** curriculum, built as a static React site that deploys to Netlify (or any static host).

- **Stack:** React 18 + Vite 5 + TypeScript 5.5, CodeMirror 6 (lazy-loaded), react-router-dom 7, sql.js (SQLite-in-WASM), plain CSS. No backend of its own — execution is either in-browser or via a Judge0-compatible provider.
- **Languages:** C, C++, Java, Python, JavaScript, SQL.

## Quick start

```bash
cd app
npm install
npm run dev      # http://localhost:5174
```

Other scripts:

| Command          | What it does                                   |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Vite dev server with SPA history fallback      |
| `npm run build`  | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview`| Serve the production build locally             |
| `npm test`       | Run the Vitest suite (44 tests)                |

## Features

- **IDE (`/ide`)** — six languages, stdin input, run with **Ctrl/Cmd+Enter**, save to browser storage, copy, download, reset-to-template, draft autosave per language.
- **Learn (`/learn`)** — six guided paths (8 topics each, 48 topics / 60+ practice problems), lesson tabs with theory, runnable examples, reference output, progress tracking, prev/next navigation.
- **Practice (`/problems/:id`)** — visible sample inputs/outputs only (no hidden tests), per-sample pass/fail with expected vs. actual diff, hint disclosure, auto "solved" on all-green, progress recording.
- **Home (`/`)** — stats, start-coding cards, recent programs, "Continue Learning" from your last visited topic.
- **Saved (`/saved`)** — browse, open, and delete programs saved in the browser.
- **Theme** — dark/light toggle (persisted), editor syntax colors follow the theme.

Progress and saved programs are **browser-local only** (localStorage; clearing site data resets them).

## Code execution

Execution is pluggable — what works out of the box, and what needs a provider:

| Language   | How it runs                          | Needs config? |
| ---------- | ------------------------------------ | ------------- |
| JavaScript | In-browser Web Worker (`input()` prelude provides stdin) | **No** — works immediately |
| SQL        | sql.js (SQLite WASM) in-browser, fresh in-memory DB seeded with sample tables per run | **No** — works immediately |
| C / C++ / Java / Python | Sent to a Judge0-compatible API | **Yes** — provider config below (until configured, the app shows an honest `NOT_CONFIGURED` notice and never fakes output) |

### Configuring compiled/interpreted languages (Netlify)

Set these as **server-side** environment variables in the Netlify UI
(*Site settings → Environment variables*) — never in frontend code:

| Variable         | Example value                                | Required |
| ---------------- | -------------------------------------------- | -------- |
| `JUDGE0_API_URL` | `https://judge0-ce.p.rapidapi.com` (or your self-hosted Judge0 base URL) | Yes |
| `JUDGE0_API_KEY` | your API key                                 | Yes (if provider requires one) |
| `JUDGE0_API_HOST`| `judge0-ce.p.rapidapi.com`                   | Only for RapidAPI providers |

The browser calls `POST /api/execute` → Netlify Function `netlify/functions/execute.mjs` → Judge0. The function adds the auth header, base64-encodes/decodes source and stdout, maps Judge0 statuses to the app's `ExecResult` shape, and returns **403** (friendly `NOT_CONFIGURED` in the UI) when no provider is set.

**Local development:** the same function runs under `netlify dev`:

```bash
npx netlify dev   # after `npm i -D netlify-cli`, or use npx as shown
```

For a self-hosted Judge0 without API keys you can bypass the function entirely by setting `VITE_JUDGE0_URL` in a local `.env` (copy `.env.example`). For a plain HTTP proxy of your own, set `VITE_EXEC_API_BASE` instead. **`VITE_*` values are public — never put secrets in them.**

## Deploying to Netlify

1. Push the repository to Git (or deploy a folder via the Netlify CLI / drag-and-drop).
2. Create a new site with **base directory = `app`** (the build settings are already in `netlify.toml`).
3. Build command `npm run build`, publish directory `dist`, Node 20 (all set in `netlify.toml`).
4. Add the `JUDGE0_*` environment variables above (optional — the site still works for JavaScript/SQL without them).
5. Deploy.

`netlify.toml` handles two redirects in the correct order:

1. `/api/* → /.netlify/functions/:splat` (so the SPA fallback cannot shadow the function),
2. `/* → /index.html` (React Router history fallback).

The site is fully static apart from the optional `/api/execute` function.

## Project structure

```
app/
├── netlify.toml                 # build + ordered redirects
├── netlify/functions/execute.mjs# Judge0 proxy (server-side secrets live here)
├── vite.config.ts / vitest.config.ts / tsconfig*.json
└── src/
    ├── main.tsx / App.tsx       # entry, routes
    ├── styles.css               # themes, layout, --syn-* editor colors
    ├── types.ts                 # LearningPath / Topic / Lesson / Problem / ExecResult
    ├── pages/                   # Home, Ide, Learn, PathOverview, TopicPage, ProblemPage, Saved
    ├── components/              # Navbar, ConsoleView, CodeEditor (lazy), CodeEditorInner
    ├── data/
    │   ├── templates.ts         # IDE starter code per language
    │   └── content/             # 6 curriculum files + index.ts aggregator
    ├── exec/
    │   ├── jsWorker.ts          # stdin prelude + worker (JavaScript)
    │   ├── sqlEngine.ts         # sql.js, seeded schema, box-table formatter
    │   ├── remote.ts            # /api/execute or VITE_JUDGE0_URL client
    │   └── index.ts             # language → adapter dispatch
    └── lib/                     # storage.ts, compare.ts, useRunner.ts (+ tests)
```

## Tests

`npm test` runs 44 Vitest tests:

- **content** — structural validation of all 6 curricula (unique ids, non-empty samples/hints/explanations).
- **sql** — every SQL lesson example and every SQL problem's reference solution executed against the real engine; regressions for comment handling, syntax errors, fresh-DB-per-run, stdin setup statements.
- **compare** — output normalization/matching rules.
- **storage** — program/draft/progress round-trips and corrupted-storage recovery (jsdom).

## Limitations (by design)

- **No hidden test cases.** Practice problems validate against the visible samples only — a correct-looking hack of a sample passes. (Deliberate: everything is auditable client-side.)
- **No accounts/sync.** Progress and saved programs live in the current browser only.
- **No server-side code execution built in.** C/C++/Java/Python require you to bring a Judge0-compatible provider; without it those languages show `NOT_CONFIGURED` (never fabricated output).
- **JavaScript `input()` prelude** provides *all* stdin at once; interactive streaming prompts (`readline`, `process`) are unavailable in the worker — starters use `input()`/`split(/\s+/)` instead.
- **SQL runs in-memory** with a fixed sample schema (students/courses/enrollments); results are capped at 200 rows for display.
- Rate limits and timeouts for remote languages are whatever the configured provider imposes (the proxy caps source at 100 KB).
