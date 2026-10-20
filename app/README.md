# CodeLab Edu

A lightweight programming-education web app: an **Online IDE** plus a **Learn & Practice** curriculum, built as a static React site that deploys to Netlify (or any static host).

- **Stack:** React 18 + Vite 5 + TypeScript 5.5, CodeMirror 6 (lazy-loaded), react-router-dom 7, sql.js (SQLite-in-WASM), Pyodide (CPython-in-WASM), wasm-clang (clang/lld-in-WASM), plain CSS. No backend of its own — execution is in-browser or via a Judge0-compatible provider.
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
| `npm test`       | Run the Vitest suite (52 offline tests; 8 C/C++ network tests skipped) |

## Features

- **IDE (`/ide`)** — six languages, stdin input, run with **Ctrl/Cmd+Enter**, save to browser storage, copy, download, reset-to-template, draft autosave per language.
- **Learn (`/learn`)** — six guided paths (8 topics each, 48 topics / 60+ practice problems), lesson tabs with theory, runnable examples, reference output, progress tracking, prev/next navigation.
- **Practice (`/problems/:id`)** — visible sample inputs/outputs only (no hidden tests), per-sample pass/fail with expected vs. actual diff, hint disclosure, auto "solved" on all-green, progress recording.
- **Home (`/`)** — stats, start-coding cards, recent programs, "Continue Learning" from your last visited topic.
- **Saved (`/saved`)** — browse, open, and delete programs saved in the browser.
- **Theme** — dark/light toggle (persisted), editor syntax colors follow the theme.

Progress and saved programs are **browser-local only** (localStorage; clearing site data resets them).

## Code execution

Execution is pluggable — here is what works out of the box and what needs a provider:

| Language | How it runs | Needs config? |
| -------- | ----------- | ------------- |
| JavaScript | In-browser Web Worker (`input()` prelude provides stdin) | **No** — works immediately |
| SQL | sql.js (SQLite WASM) in-browser, fresh in-memory DB seeded with sample tables per run | **No** — works immediately |
| Python | In-browser **Pyodide 0.29.5** (CPython 3.13 compiled to WASM) in a dedicated worker; ~10 MB downloaded from jsDelivr on first run, then cached by the browser | **No** — needs internet for the first run |
| C / C++ | In-browser **wasm-clang** (clang 8 + lld + WASI sysroot) in a dedicated worker; ~60 MB downloaded from binji.github.io on first run, then cached | **No** — needs internet for the first run |
| Java | In-browser **CheerpJ 4.3** (a WebAssembly JVM) in a classic worker, with javac provided by a bundled Java 8 `tools.jar`; ~35 MB downloaded from the CheerpJ CDN + `public/tools.jar` on first run, then cached | **No** — needs internet for the first run |

All six languages run in the browser. Python, C, C++ and Java also **fall back to the provider** automatically if their in-browser engine cannot load (e.g. first run while offline) *and* a Judge0-compatible provider is configured. Until any engine/provider is available the app shows an honest `NOT_CONFIGURED` / `engine unavailable` notice and never fakes output.

### In-browser engines

- Keep one long-lived worker per engine so the toolchain stays warm: the first Python run takes a few seconds, and after that runs are fast; the first C/C++ compile takes ~5–8 s, later ones ~1–3 s; the first Java run downloads the CheerpJ runtime + javac, later runs ~1–2 s.
- Runs are serialized, each has a wall-clock limit (15 s per run; 180 s / 240 s / 300 s for the cold toolchain load), and a runaway program gets its worker terminated and respawned.
- The engines are **fetched from public CDNs at runtime** (pinned Pyodide 0.29.5 from jsDelivr; binji/wasm-clang from GitHub Pages, Apache-2.0; CheerpJ 4.3 from `cjrtnc.leaningtech.com`, Leaning Technologies Community License). Override the C/C++ base with `VITE_WASM_CLANG_CDN` or the CheerpJ loader with `VITE_CHEERPJ_LOADER` if you mirror the assets.
- Type anything in the **stdin panel** before running: `input()` / `scanf` / `cin` / `Scanner` read from it. Input is provided up-front, not streamed interactively.

### Java engine (CheerpJ) details

- **Generated classic worker.** `public/javaWorker.js` is generated from `scripts/javaWorker.template.js` (plus the embedded `CjRunner` bridge source) by `scripts/gen-java-worker.mjs`, which runs on `predev`/`prebuild`. Edit those, not the generated file. It must stay a **classic** worker served from a real HTTP URL: CheerpJ 4.3 does not work in ES-module workers (its loader calls `importScripts()`), and it resolves the `/app/...` web root against the worker's own location, so a `blob:`-URL worker cannot find `tools.jar`.
- **`public/tools.jar` is fetched, not committed** (see `.gitignore`). `scripts/fetch-tools-jar.mjs` downloads the ~18 MB Java 8 javac from the CheerpJ JavaFiddle repo on `predev`/`prebuild` (override the source with `TOOLS_JAR_URL`). CheerpJ ships a JRE only, so compiling needs this on the classpath at `/app/tools.jar`.
- **Single-file programs.** The bridge writes your source, runs javac, finds the `public static void main(String[])` class by reflection, redirects `System.out`/`System.err`/`System.in`, and reports real stdout, stderr, compile diagnostics and stack traces. The stdin panel feeds `System.in`. Packages, multiple files and interactive input are not supported.
- **Attribution & licensing.** CheerpJ Core is by Leaning Technologies and free under the [Community License](https://cheerpj.com/license) for personal, FOSS and public educational use — attribution required. The bundled `tools.jar` is OpenJDK's javac (GPLv2 + Classpath Exception). Commercial, institutional or self-hosted use needs a paid CheerpJ license.

### Optional: the Judge0 fallback provider

All six languages run in the browser, so **no configuration is required to use the app**. These variables only matter as a *fallback* — if an in-browser engine cannot load (e.g. first run while offline) the request is retried against a Judge0-compatible service instead.

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
4. Add the `JUDGE0_*` environment variables above (optional — no language needs them; all six run fully in the browser. They only matter as a fallback when an in-browser engine can't load).
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
    │   ├── pyodideCore.ts       # Pyodide driver (input shim, stdout capture)
    │   ├── pyodideWorker.ts     # worker: lazy CDN load + run queue
    │   ├── wasmClangHarness.ts  # clang/lld harness (compile, link, run, diagnostics)
    │   ├── wasmClangWorker.ts   # worker: loads shared.js + harness
    │   ├── localWorkerEngine.ts # persistent-worker manager (timeouts, restart)
    │   ├── remote.ts            # /api/execute or VITE_JUDGE0_URL client
    │   └── index.ts             # language → adapter dispatch (+ fallback)
    └── lib/                     # storage.ts, compare.ts, useRunner.ts (+ tests)
```

## Tests

`npm test` runs **52 offline tests**:

- **content** — structural validation of all 6 curricula (unique ids, non-empty samples/hints/explanations).
- **sql** — every SQL lesson example and every SQL problem's reference solution executed against the real engine; regressions for comment handling, syntax errors, fresh-DB-per-run, stdin setup statements.
- **compare** — output normalization/matching rules.
- **storage** — program/draft/progress round-trips and corrupted-storage recovery (jsdom).
- **pyodide** — real CPython (loaded from `node_modules`, no network) runs every Python lesson example, multi-line stdin, `input()` prompts, runtime/syntax/EOF errors, global isolation.

A further **8 network integration tests** exercise the real wasm-clang toolchain (downloads ~60 MB once): C hello world (with an exact-stderr check — no toolchain noise), `scanf` stdin, C++ iostream, real compiler warnings still surfaced, compile errors, runtime crashes, and every C and C++ curriculum lesson example. Run them with:

```bash
NET_TESTS=1 npx vitest run src/exec/wasmClang.test.ts   # bash / macOS / Linux
$env:NET_TESTS="1"; npx vitest run src/exec/wasmClang.test.ts   # PowerShell
```

## Limitations (by design)

- **No hidden test cases.** Practice problems validate against the visible samples only — a correct-looking hack of a sample passes. (Deliberate: everything is auditable client-side.)
- **No accounts/sync.** Progress and saved programs live in the current browser only.
- **First run of Python / C / C++ / Java needs internet** to fetch the WASM toolchains from public CDNs (~10 MB, ~60 MB and ~35 MB + the `tools.jar`). After that they are browser-cached. If a fetch fails and no Judge0 provider is configured, the app reports that honestly instead of faking output.
- **C/C++ is clang 8 + libc++ from wasm-clang.** `<algorithm>` / `std::sort` links against a to-float128 helper (`__lttf2`) that the bundled sysroot lacks, so those examples use hand-written loops. It is single-file, freestanding-`main` C/C++ — no filesystem, threads or external libraries, and `fprintf(stderr, …)` is merged into the output pane. Toolchain command echoes are hidden; compile diagnostics and warnings are shown.
- **Python is stock CPython + stdlib** in Pyodide (no third-party packages are installed). Programs run in a fresh module namespace each time; `input()` reads the stdin panel.
- **JavaScript `input()` prelude** provides *all* stdin at once; interactive streaming prompts (`readline`, `process`) are unavailable in the worker — starters use `input()`/`split(/\s+/)` instead.
- **SQL runs in-memory** with a fixed sample schema (students/courses/enrollments); results are capped at 200 rows for display.
- **Java is a JRE-only JVM (CheerpJ 4.3)**: single-file programs with `public class Main` (no packages or multiple files). Compilation uses the bundled OpenJDK `tools.jar`; the first run also downloads the CheerpJ runtime from their CDN. Interactive input via `Scanner`/`System.in` is supported from the stdin panel. The Judge0 fallback (if configured) rate limits and timeouts are whatever the provider imposes — the proxy caps source at 100 KB.
