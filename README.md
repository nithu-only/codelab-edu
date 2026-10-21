# CodeLab Edu

An online IDE and guided learning app for six languages: **C, C++, Java, Python, JavaScript, SQL**.
Everything runs client-side in the browser (WebAssembly) — no server required.

> **Looking for the legacy Docker runner?** The old Spring Boot + React/Monaco backend lives on the
> [`docker`](../../tree/docker) branch. `main` contains only the current `app/`.

- **IDE** (`/ide`) — code editor with stdin, one-click/Ctrl+Enter run, save to browser storage, copy/download, per-language drafts.
- **Learn** (`/learn`) — six curriculum paths (8 topics each, 48 topics, 60+ practice problems) with theory, runnable examples, and progress tracking.
- **Practice** (`/problems/:id`) — visible-sample test runner with pass/fail diffs, hints, and auto "solved" detection.
- **Home / Saved / Themes** — dashboard with continue-learning, saved programs browser, dark/light mode.

### Quick start

```bash
cd app
npm install
npm run dev        # http://localhost:5174
```

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Dev server (port 5174); `predev` fetches `tools.jar` and generates the Java worker |
| `npm run build` | Type-check + production build → `app/dist/` |
| `npm test` | Vitest suite — 60 tests (content, SQL engine, Python, comparison, storage; C/C++ network tests skip by default) |
| `NET_TESTS=1 npm test` | Adds the 8 wasm-clang integration tests (downloads the C/C++ toolchain once) |
| `npm run verify:java` | Headless-Chrome end-to-end check of the Java engine (dev server must be running) |
| `npm run preview` | Serve the production build locally |

### Code execution model

| Language | Runtime | Config needed |
| -------- | ------- | ------------- |
| JavaScript | In-browser Web Worker (`input()` provides stdin) | None |
| SQL | sql.js (SQLite WASM), fresh seeded in-memory DB per run | None |
| C / C++ | In-browser wasm-clang (clang + lld + WASI sysroot), toolchain cached after first load | None (internet on first run) |
| Python | In-browser Pyodide 0.29.5 (CPython 3.13 WASM), toolchain cached after first load | None (internet on first run) |
| Java | In-browser CheerpJ 4.3 (WebAssembly JVM) with javac from a bundled `tools.jar`, toolchain cached after first load | None (internet on first run) |

All six languages run in the browser. Python/C/C++/Java also fall back to the Judge0 provider when their in-browser engine can't load and a provider is configured. Without any engine/provider the app shows an honest `NOT_CONFIGURED` notice — output is never faked. Full details, in-browser engine notes (including CheerpJ attribution/licensing), local-dev proxy setup (`netlify dev`, `VITE_JUDGE0_URL`), and all environment variables: [`app/README.md`](app/README.md).

### Deploy (Netlify)

1. Create a site with **base directory = `app`** (build command, publish dir, Node 20, and ordered redirects are already in [`app/netlify.toml`](app/netlify.toml)).
2. Optionally add the `JUDGE0_*` environment variables as a fallback for any language (no language needs them — all six run in the browser).
3. Deploy — the site is static apart from the optional `/api/execute` function (SPA fallback cannot shadow it; redirects are ordered correctly).

---

## Repository layout

```
codelab/
├── app/                  # CodeLab Edu — Netlify-ready education app
│   ├── netlify.toml      # build + ordered /api/* and SPA redirects
│   ├── netlify/functions/execute.mjs   # Judge0 proxy (optional fallback)
│   ├── scripts/          # tools.jar fetch, Java worker generator, Java e2e verify
│   ├── public/           # generated javaWorker.js + fetched tools.jar (git-ignored)
│   └── src/              # pages, components, curricula (data/content), exec engines, lib
├── netlify.toml          # root config: base = app/, build + redirects
└── README.md             # this file
```

The legacy Docker runner (Spring Boot backend + React/Monaco frontend, `CONTRACT.md`,
`V2_CONTRACT.md`, `docs/`, `scripts/`) lives on the [`docker`](../../tree/docker) branch.

## License / status

`app/` is the active product. In-browser engines: Pyodide (Python), wasm-clang (C/C++), CheerpJ
(Java, Community License — attribution required), sql.js (SQL).
