/**
 * Unified execution entry point. Routes each language to its adapter:
 *  - javascript -> Web Worker in the browser
 *  - sql        -> sql.js (SQLite WASM) in the browser
 *  - c/cpp/java/python -> Judge0-compatible remote service (direct or proxied)
 *
 * Never fabricates output: errors surface as NOT_CONFIGURED / ERROR with details.
 */
import type { ExecRequest, ExecResult, LanguageId } from "../types";
import { executeInWorker } from "./jsWorker";
import { executeSql } from "./sqlEngine";
import { executeRemote, remoteSupported } from "./remote";

export interface ExecuteOptions {
  signal?: AbortSignal;
}

export function isLocalLanguage(lang: LanguageId): boolean {
  return lang === "javascript" || lang === "sql";
}

export function isRemoteLanguage(lang: LanguageId): boolean {
  return remoteSupported(lang);
}

export async function execute(req: ExecRequest, opts: ExecuteOptions = {}): Promise<ExecResult> {
  switch (req.language) {
    case "javascript":
      return executeInWorker(req);
    case "sql":
      return executeSql(req);
    case "c":
    case "cpp":
    case "java":
    case "python":
      return executeRemote(req, opts.signal);
    default:
      return {
        status: "NOT_CONFIGURED",
        stdout: "",
        stderr: `Unsupported language: ${String(req.language)}`,
      };
  }
}
