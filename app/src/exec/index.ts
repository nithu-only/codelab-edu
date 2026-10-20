/**
 * Unified execution entry point. Routes each language to its adapter:
 *  - javascript -> Web Worker in the browser
 *  - sql        -> sql.js (SQLite WASM) in the browser
 *  - python     -> Pyodide (CPython WASM) in the browser, remote fallback
 *  - c/cpp      -> wasm-clang (Clang/LLD WASM) in the browser, remote fallback
 *  - java       -> CheerpJ (WASM JVM + javac) in the browser, remote fallback
 *
 * Never fabricates output: errors surface as NOT_CONFIGURED / ERROR with details.
 * When an in-browser engine cannot load (e.g. offline) and a remote provider is
 * configured, the request transparently falls back to the remote.
 */
import type { ExecRequest, ExecResult, LanguageId } from "../types";
import { executeInWorker } from "./jsWorker";
import { executeSql } from "./sqlEngine";
import { executeRemote, remoteSupported } from "./remote";
import { executePyodide } from "./pyodideAdapter";
import { executeWasmClang } from "./wasmClangAdapter";
import { executeJava } from "./javaAdapter";

export interface ExecuteOptions {
  signal?: AbortSignal;
}

const IN_BROWSER_LANGUAGES: ReadonlySet<LanguageId> = new Set([
  "javascript",
  "sql",
  "python",
  "c",
  "cpp",
  "java",
]);

export function isLocalLanguage(lang: LanguageId): boolean {
  return IN_BROWSER_LANGUAGES.has(lang);
}

export function isRemoteLanguage(lang: LanguageId): boolean {
  return remoteSupported(lang);
}

/** Try the in-browser engine first; if its infrastructure is unavailable and a
 * remote provider is configured, run remotely instead. */
async function withRemoteFallback(
  local: Promise<ExecResult>,
  remote: () => Promise<ExecResult>,
): Promise<ExecResult> {
  const result = await local;
  if (!result.engineUnavailable) return result;
  const fallback = await remote();
  if (fallback.status !== "NOT_CONFIGURED") return fallback;
  return {
    ...fallback,
    stderr: `${fallback.stderr}\n\nIn-browser engine also failed: ${result.stderr}`,
  };
}

export async function execute(req: ExecRequest, opts: ExecuteOptions = {}): Promise<ExecResult> {
  switch (req.language) {
    case "javascript":
      return executeInWorker(req);
    case "sql":
      return executeSql(req);
    case "python":
      return withRemoteFallback(
        executePyodide(req, opts.signal),
        () => executeRemote(req, opts.signal),
      );
    case "c":
    case "cpp":
      return withRemoteFallback(
        executeWasmClang(req, opts.signal),
        () => executeRemote(req, opts.signal),
      );
    case "java":
      return withRemoteFallback(
        executeJava(req, opts.signal),
        () => executeRemote(req, opts.signal),
      );
    default:
      return {
        status: "NOT_CONFIGURED",
        stdout: "",
        stderr: `Unsupported language: ${String(req.language)}`,
      };
  }
}
