import type { LanguageId, ProgressState, SavedProgram } from "../types";

const KEYS = {
  programs: "codelabedu.programs.v1",
  progress: "codelabedu.progress.v1",
  theme: "codelabedu.theme.v1",
  draftPrefix: "codelabedu.draft.",
  lastLang: "codelabedu.lastLang.v1",
} as const;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded / private mode — fail silently, app still works */
  }
}

function readJson<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  if (!raw) {
    // Return a COPY — callers (e.g. completeTopic) mutate the object they get,
    // and sharing the module-level fallback would leak state across reads.
    try {
      return structuredClone(fallback);
    } catch {
      return fallback;
    }
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    try {
      return structuredClone(fallback);
    } catch {
      return fallback;
    }
  }
}

/* ---------- saved programs ---------- */

export function listPrograms(): SavedProgram[] {
  const all = readJson<SavedProgram[]>(KEYS.programs, []);
  return [...all].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveProgram(p: Omit<SavedProgram, "id" | "updatedAt"> & { id?: string }): SavedProgram {
  const all = readJson<SavedProgram[]>(KEYS.programs, []);
  const now = Date.now();
  const id = p.id ?? `prog-${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const next: SavedProgram = { ...p, id, updatedAt: now };
  const idx = all.findIndex((x) => x.id === id);
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  safeSet(KEYS.programs, JSON.stringify(all.slice(0, 200)));
  return next;
}

export function deleteProgram(id: string): void {
  const all = readJson<SavedProgram[]>(KEYS.programs, []).filter((p) => p.id !== id);
  safeSet(KEYS.programs, JSON.stringify(all));
}

export function getProgram(id: string): SavedProgram | undefined {
  return readJson<SavedProgram[]>(KEYS.programs, []).find((p) => p.id === id);
}

/* ---------- drafts (per language, autosaved from IDE) ---------- */

export function getDraft(lang: LanguageId): { code: string; stdin: string } | undefined {
  return readJson<{ code: string; stdin: string } | undefined>(KEYS.draftPrefix + lang, undefined);
}

export function setDraft(lang: LanguageId, code: string, stdin: string): void {
  safeSet(KEYS.draftPrefix + lang, JSON.stringify({ code, stdin }));
}

export function getLastLang(): LanguageId | undefined {
  return readJson<LanguageId | undefined>(KEYS.lastLang, undefined);
}

export function setLastLang(lang: LanguageId): void {
  safeSet(KEYS.lastLang, JSON.stringify(lang));
}

/* ---------- progress ---------- */

const EMPTY_PROGRESS: ProgressState = { completedTopics: [], solvedProblems: [] };

export function getProgress(): ProgressState {
  return readJson<ProgressState>(KEYS.progress, EMPTY_PROGRESS);
}

export function completeTopic(lang: LanguageId, topicId: string): ProgressState {
  const p = getProgress();
  const key = `${lang}:${topicId}`;
  if (!p.completedTopics.includes(key)) p.completedTopics = [...p.completedTopics, key];
  p.lastTopic = key;
  safeSet(KEYS.progress, JSON.stringify(p));
  return p;
}

export function visitTopic(lang: LanguageId, topicId: string): ProgressState {
  const p = getProgress();
  p.lastTopic = `${lang}:${topicId}`;
  safeSet(KEYS.progress, JSON.stringify(p));
  return p;
}

export function solveProblem(problemId: string): ProgressState {
  const p = getProgress();
  if (!p.solvedProblems.includes(problemId)) p.solvedProblems = [...p.solvedProblems, problemId];
  safeSet(KEYS.progress, JSON.stringify(p));
  return p;
}

/* ---------- theme ---------- */

export type Theme = "dark" | "light";

export function getTheme(): Theme {
  return safeGet(KEYS.theme) === "light" ? "light" : "dark";
}

export function setTheme(t: Theme): void {
  safeSet(KEYS.theme, t);
  document.documentElement.setAttribute("data-theme", t);
}
