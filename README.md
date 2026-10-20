# CodeLab

Programming-education platform with two tracks in one repository:

| Track | Path | What it is |
| ----- | ---- | ---------- |
| **CodeLab Edu** (current) | [`app/`](app/) | Lightweight Online IDE + Learn & Practice curriculum. React + Vite + TypeScript, deploys to Netlify. **Start here.** |
| CodeLab Runner (legacy) | [`backend/`](backend/), [`frontend/`](frontend/) | Docker-isolated polyglot code execution platform: Spring Boot 3.2 backend + React/Monaco frontend. Contract: [`CONTRACT.md`](CONTRACT.md). |

Shared docs: [`docs/`](docs/) (legacy setup guides), [`V2_CONTRACT.md`](V2_CONTRACT.md), [`memory.md`](memory.md).

---

## CodeLab Edu (`app/`)

An online IDE and guided learning app for six languages: **C, C++, Java, Python, JavaScript, SQL**.

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
| `npm run dev` | Dev server (port 5174) |
| `npm run build` | Type-check + production build → `app/dist/` |
| `npm test` | Vitest suite (44 tests: content, SQL engine, comparison, storage) |
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

## CodeLab Runner (legacy)

Docker-isolated execution platform (kept intact, not required by `app/`):

- **Backend** — Spring Boot 3.2 / Java 17, `POST /api/execute`, runs code in locked-down containers (`--network none`, CPU/memory/pids limits, read-only FS, 10s timeout). See [`CONTRACT.md`](CONTRACT.md).
- **Frontend** — React 18 + Vite + Monaco editor (port 5173).
- **Prerequisites** — Java 17, Maven 3.9+, Node 18+, Docker 24+ with Compose v2. Full setup: [`docs/SETUP.md`](docs/SETUP.md); helper scripts in [`scripts/`](scripts/).

```bash
docker compose up --build     # backend :8080 + language containers
cd frontend && npm install && npm run dev   # frontend :5173
```

---

## Repository layout

```
codelab/
├── app/                  # CodeLab Edu — Netlify-ready education app (current)
│   ├── netlify.toml      # build + ordered /api/* and SPA redirects
│   ├── netlify/functions/execute.mjs   # Judge0 proxy (server-side secrets)
│   └── src/              # pages, components, curricula (data/content), exec adapters, lib
├── backend/              # Legacy Spring Boot execution service (Docker runner)
├── frontend/             # Legacy React + Monaco frontend
├── docs/                 # Legacy setup documentation
├── scripts/              # Legacy dev helper scripts
├── workspaces/           # Runtime scratch space (git-ignored)
├── CONTRACT.md           # Legacy runner API contract
├── docker-compose.yml    # Legacy stack (backend + language images)
└── README.md             # this file
```

## License / status

Private project. `app/` is the active product; `backend/` + `frontend/` are preserved as the legacy Docker runner.
