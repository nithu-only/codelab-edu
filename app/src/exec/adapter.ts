import type { ExecRequest, ExecResult, LanguageId } from "../types";

export interface ExecutionAdapter {
  id: string;
  supports(language: LanguageId): boolean;
  execute(req: ExecRequest, signal?: AbortSignal): Promise<ExecResult>;
}

export const EXEC_TIMEOUT_MS = 15000;

export function trimOutput(s: string, max = 100_000): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n[output truncated]";
}

export function normalizeOutput(s: string): string {
  return s.replace(/\r\n/g, "\n");
}
