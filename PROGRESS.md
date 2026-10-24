# CodeLab Edu — Progress Log

Last updated: 2026-10-22

## Current objective

Upgrade the **C** course into a comprehensive W3Schools-style interactive tutorial
(sidebar navigation, per-lesson pages, editable runnable examples, deep coverage of
data types and format specifiers) without changing the other five courses, the IDE,
or the execution engines.

## Status: COMPLETE locally, NOT committed, NOT pushed

All work is in the working tree on `main`.

- Local `main`: `f56e4b1 Add live Netlify URL to READMEs`
- `origin/main`: `c1e65a8` (one commit ahead — an earlier C-curriculum attempt)
- **A plain `git push` will be rejected until that divergence is resolved.**
  Decide between `git reset --hard origin/main` (discard local-only history view) or
  recreating the commit on top of `origin/main` before pushing.
- Do not commit/push without explicit approval.

## What was built this session

### C tutorial content

- **18 sections / 118 lessons / 31 practice problems**
- Files:
  - `app/src/data/content/c.ts` — assembles `cPath` from section modules
  - `app/src/data/content/c/helpers.ts` — `L()` lesson and `P()` problem builders
  - `app/src/data/content/c/sections1.ts` — Getting Started, Comments & Syntax,
    Tokens, Variables, Data Types
  - `app/src/data/content/c/sections2.ts` — Format Specifiers, Input & Output,
    Operators, Conditions, Loops
  - `app/src/data/content/c/sections3.ts` — Functions, Arrays, Strings, Pointers
  - `app/src/data/content/c/sections4.ts` — Structures & Unions, Dynamic Memory,
    File Handling, Preprocessor
- Every lesson has: concept, syntax, runnable example, expected output,
  objectives, explanation, tips, mistakes. Enforced by tests.
- Format-specifier section explicitly covers `printf` vs `scanf` differences
  (`%f` vs `%lf`), length modifiers (`%hd`, `%ld`, `%lld`, `%zu`), width/precision,
  `%s` safety, and a reference table.

### Tutorial UI

- `app/src/components/learn/CTutorialLayout.tsx` — sidebar shell:
  search, collapsible sections, active highlight, section completion ticks,
  breadcrumbs, previous/next pager
- `app/src/components/learn/ctutorial.module.css` — layout styles; responsive
  (sidebar stacks at ≤980px)
- `app/src/pages/CTutorialPage.tsx` — lesson page: objectives, syntax, editable
  CodeMirror example, ▶ Try it Yourself, live console, expected output,
  explanation, tips, mistakes, practice links, "Mark topic as complete"
- Route added in `app/src/App.tsx`:
  - `/learn/c/:topicId?lesson=<lessonId>` → `CTutorialPage`
  - `/learn/:lang`, `/learn/:lang/:topicId`, IDE, problems, saved all unchanged

### Data model

- `app/src/types.ts`
  - `Topic.section?: string` (groups topics in the sidebar)
  - `Lesson` gained optional `explanation`, `tips`, `mistakes`, `objectives`
  - Backward compatible; other languages unaffected

### Tests

- `app/src/data/content.test.ts` gained 3 tests:
  - full syllabus present and grouped
  - every lesson has real content (no placeholders)
  - format-specifier rules are actually taught

## Verification results (all passing)

| Check | Result |
| --- | --- |
| `.\node_modules\.bin\tsc --noEmit` | clean |
| `npx vitest run` | 52 passed, 8 network tests skipped |
| `NET_TESTS=1 npx vitest run src/exec/wasmClang.test.ts -t "runs every C curriculum"` | **all 118 C examples compiled, ran, and matched documented output** |
| `npm run build` | succeeds (prebuild fetches `tools.jar`, generates `public/javaWorker.js`) |
| Browser (Puppeteer + Chrome, 375–1920 px) | no horizontal overflow; 18 sections / 118 links render; breadcrumbs, active state, prev/next navigation work |
| End-to-end run in browser | `c-what-is-c` example printed `Hello, World!`, editor is editable |

## Notes / gotchas discovered

- **The wasm-clang sandbox has a temporary in-memory filesystem.** `fopen("x","w")`
  succeeds during a run; files disappear between runs. File-handling lessons were
  corrected to match this real behavior (writes succeed; reads of files not created
  in the same run return `NULL`).
- `argv[0]` in the runner is `test.wasm`; the command-line-args lesson avoids printing
  it so the documented output stays stable.
- Only browser console error is a harmless `favicon.ico` 404.
- Completion is tracked per **section** (`c:<topicId>`) because each section is one
  topic. Problems use the existing per-problem progress keys.
- PowerShell 5.1: no `head`/`tail`/`grep`; use `Select-Object -First/-Last` and
  `Select-String`.
- `npx tsc --noEmit` can fail with "This is not the tsc command"; use
  `.\node_modules\.bin\tsc --noEmit` or `npx tsc -b --force`.

## How to run

```powershell
cd app
npm run dev
# open http://localhost:5173/learn/c
```

Java verification (needs dev server + Chrome):
`npm run verify:java`

## Suggested next steps

1. Review the tutorial visually and tune spacing/typography in
   `ctutorial.module.css`.
2. Optionally switch completion from section-level to lesson-level
   (would need a new storage key alongside `completedTopics`).
3. Add more practice problems for advanced sections if desired.
4. Resolve the `origin/main` divergence, then commit the C tutorial as one
   focused change (content + UI + tests).
