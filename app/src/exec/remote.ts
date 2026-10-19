/**
 * Remote execution adapter for C, C++, Java and Python via a Judge0-compatible API.
 *
 * Config (see .env.example):
 *  - VITE_EXEC_API_BASE  -> default "/api/execute" (Netlify Function alias declared before the
 *                           SPA fallback in netlify.toml; secrets stay on the server)
 *  - VITE_JUDGE0_URL     -> optional direct Judge0-compatible base URL (only for instances that
 *                           require no secret, e.g. a self-hosted Judge0)
 *
 * The frontend never holds API keys: when a provider needs a secret, requests go
 * through the Netlify Function proxy which reads it from server-side env vars.
 */
import type { ExecRequest, ExecResult, LanguageId } from "../types";
import { EXEC_TIMEOUT_MS, normalizeOutput, trimOutput } from "./adapter";

/** Judge0 language IDs for the distro used by RapidAPI / official Judge0. */
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  c: 50, // C (GCC 9.2.0)
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  python: 71, // Python (3.8.1)
  javascript: 63, // Node.js (12.14.0) — fallback only; browser worker is preferred
};

const REMOTE_LANGUAGES: ReadonlySet<LanguageId> = new Set(["c", "cpp", "java", "python"]);

function b64(s: string): string {
  // UTF-8 safe base64 (btoa fails on non-latin1)
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function fromB64(s: string | null | undefined): string {
  if (!s) return "";
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

interface Judge0Status {
  id: number;
  description: string;
}

interface Judge0Submission {
  status?: Judge0Status;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
}

export function remoteSupported(lang: LanguageId): boolean {
  return REMOTE_LANGUAGES.has(lang);
}

function mapStatus(s: Judge0Status | undefined, exitHint: boolean): ExecResult["status"] {
  if (!s) return "ERROR";
  switch (s.id) {
    case 3: // Accepted
      return exitHint ? "RUNTIME_ERROR" : "SUCCESS";
    case 4: // Wrong Answer (only when judge compares — not used here)
      return "SUCCESS";
    case 5: // Time Limit Exceeded
      return "TIMEOUT";
    case 6: // Compilation Error
      return "COMPILE_ERROR";
    case 11: // Runtime Error (NZEC)
    case 12: // Runtime Error (SIGSEGV etc.)
    case 13: // Internal Error
    case 14: // Exec Format Error
      return s.id === 13 ? "ERROR" : "RUNTIME_ERROR";
    case 15: // Output Limit Exceeded
      return "RUNTIME_ERROR";
    default:
      // 1 Queued, 2 Processing shouldn't happen with wait=true, others -> ERROR
      return s.id <= 2 ? "ERROR" : "ERROR";
  }
}

function endpoint(): { url: string; direct: boolean } {
  const direct = (import.meta.env.VITE_JUDGE0_URL as string | undefined)?.replace(/\/$/, "");
  if (direct) return { url: `${direct}/submissions?base64_encoded=true&wait=true`, direct: true };
  const base = (
    (import.meta.env.VITE_EXEC_API_BASE as string | undefined) || "/api/execute"
  ).replace(/\/$/, "");
  return { url: `${base}?wait=true`, direct: false };
}

export async function executeRemote(req: ExecRequest, signal?: AbortSignal): Promise<ExecResult> {
  const langId = JUDGE0_LANGUAGE_IDS[req.language];
  if (!langId) {
    return {
      status: "NOT_CONFIGURED",
      stdout: "",
      stderr: `Language "${req.language}" is not supported by the remote executor.`,
    };
  }

  const { url, direct } = endpoint();
  const start = performance.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXEC_TIMEOUT_MS + 5000);
  signal?.addEventListener("abort", () => controller.abort());

  try {
    const body = direct
      ? {
          language_id: langId,
          source_code: b64(req.code),
          stdin: b64(req.stdin),
          cpu_time_limit: 10,
          wall_time_limit: 15,
        }
      : {
          language: req.language,
          sourceCode: req.code,
          stdin: req.stdin,
        };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (res.status === 429) {
      return {
        status: "ERROR",
        stdout: "",
        stderr:
          "Rate limit reached on the execution service. Wait a moment and try again, or configure your own execution provider (see README).",
        timeMs: Math.round(performance.now() - start),
      };
    }
    if (res.status === 401 || res.status === 403) {
      return {
        status: "NOT_CONFIGURED",
        stdout: "",
        stderr:
          "Execution service rejected the request (unauthorized). Configure JUDGE0_API_URL / JUDGE0_API_KEY in your deployment — see README.",
        timeMs: Math.round(performance.now() - start),
      };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        status: "ERROR",
        stdout: "",
        stderr: `Execution service error (HTTP ${res.status}). ${text.slice(0, 300)}`,
        timeMs: Math.round(performance.now() - start),
      };
    }

    const data = (await res.json()) as Judge0Submission & { stdout?: string };
    let stdout: string;
    let stderr: string;

    if (direct) {
      stdout = fromB64(data.stdout);
      stderr = fromB64(data.stderr);
      const compileOut = fromB64(data.compile_output);
      const message = fromB64(data.message);
      if (compileOut) stderr = stderr ? `${stderr}\n${compileOut}` : compileOut;
      if (!stderr && message) stderr = message;
    } else {
      // Netlify proxy returns plain (non-base64) strings
      stdout = typeof data.stdout === "string" ? data.stdout : "";
      stderr = typeof data.stderr === "string" ? data.stderr : "";
      const compileOut = (data as { compile_output?: string }).compile_output;
      const message = (data as { message?: string }).message;
      if (compileOut) stderr = stderr ? `${stderr}\n${compileOut}` : compileOut;
      if (!stderr && message) stderr = message;
    }

    const status = mapStatus(data.status, false);
    const timeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : Math.round(performance.now() - start);

    return {
      status,
      stdout: trimOutput(normalizeOutput(stdout)),
      stderr: trimOutput(normalizeOutput(stderr)),
      timeMs,
    };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return {
      status: aborted ? "TIMEOUT" : "NOT_CONFIGURED",
      stdout: "",
      stderr: aborted
        ? `[Execution timed out after ${(EXEC_TIMEOUT_MS + 5000) / 1000}s — the service did not respond in time.]`
        : `Could not reach the execution service: ${err instanceof Error ? err.message : String(err)}. ` +
          "JavaScript and SQL still run locally in your browser; for C/C++/Java/Python " +
          "configure an execution provider (see README → Code execution).",
      timeMs: Math.round(performance.now() - start),
    };
  } finally {
    clearTimeout(timer);
  }
}
