import type { ExecutionResponse, Language } from "./types";

const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8080";
// Normalize: avoid double /api when VITE_API_URL is "/api" (docker-compose nginx proxy)
function getExecuteUrl(): string {
  const base = RAW_API_BASE.replace(/\/$/, "");
  if (base === "/api" || base.endsWith("/api")) {
    return `${base}/execute`;
  }
  return `${base}/api/execute`;
}
const API_BASE = RAW_API_BASE;

export async function executeCode(
  language: Language,
  sourceCode: string,
  stdin: string,
  signal?: AbortSignal,
  executionId?: string
): Promise<ExecutionResponse> {
  const res = await fetch(getExecuteUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, sourceCode, stdin, executionId }),
    signal,
  });

  if (!res.ok) {
    // Try to parse error body
    let errBody: unknown = null;
    try {
      errBody = await res.json();
    } catch {
      errBody = await res.text();
    }
    const msg =
      typeof errBody === "object" && errBody !== null && "error" in errBody
        ? String((errBody as { error: string }).error)
        : `Request failed with ${res.status}`;
    const details =
      typeof errBody === "object" && errBody !== null && "details" in errBody
        ? (errBody as { details?: string[] }).details
        : undefined;
    const full = details?.length ? `${msg}: ${details.join("; ")}` : msg;
    throw new Error(full);
  }

  const data = (await res.json()) as ExecutionResponse;
  return data;
}

export async function cancelExecution(executionId: string): Promise<ExecutionResponse> {
  const base = RAW_API_BASE.replace(/\/$/, "");
  const url = base === "/api" || base.endsWith("/api") ? `${base}/execute/${executionId}/cancel` : `${base}/api/execute/${executionId}/cancel`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cancel failed ${res.status}: ${txt}`);
  }
  return (await res.json()) as ExecutionResponse;
}

export function getApiBase(): string {
  return API_BASE;
}
