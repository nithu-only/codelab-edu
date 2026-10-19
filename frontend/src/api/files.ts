import type { FileEntry, FileContent } from "../types";

const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8080";

function getBase(): string {
  return RAW_API_BASE.replace(/\/$/, "");
}

function getFilesBaseUrl(): string {
  const base = getBase();
  if (base === "/api" || base.endsWith("/api")) return `${base}/files`;
  return `${base}/api/files`;
}

function getStudentId(): string {
  try {
    const ls = localStorage.getItem("X-Student-Id") || localStorage.getItem("studentId") || "";
    if (ls && ls.trim()) return ls.trim();
  } catch { /* ignore */ }
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("studentId");
    if (q && q.trim()) return q.trim();
  } catch { /* ignore */ }
  return "dev-student";
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Student-Id": getStudentId(),
  };
}

function studentQuerySuffix(): string {
  // also append query for fallback resolver
  const sid = getStudentId();
  return `studentId=${encodeURIComponent(sid)}`;
}

async function parseError(res: Response): Promise<string> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    try {
      body = await res.text();
    } catch { /* */ }
  }
  if (typeof body === "object" && body !== null && "error" in body) {
    const e = (body as { error: string; details?: string[] }).error;
    const d = (body as { details?: string[] }).details;
    return d?.length ? `${e}: ${d.join("; ")}` : e;
  }
  if (typeof body === "string" && body.trim()) return body;
  return `Request failed ${res.status} ${res.statusText}`;
}

export async function listFiles(path?: string): Promise<FileEntry[]> {
  const base = getFilesBaseUrl();
  const params = new URLSearchParams();
  params.set("studentId", getStudentId());
  if (path) params.set("path", path);
  const url = `${base}?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  // backend returns array directly
  if (Array.isArray(data)) return data as FileEntry[];
  // fallback if wrapped
  if (data && Array.isArray((data as { files?: FileEntry[] }).files)) return (data as { files: FileEntry[] }).files;
  return [];
}

export async function createFile(path: string, content: string): Promise<FileContent> {
  const base = getFilesBaseUrl();
  const url = `${base}?${studentQuerySuffix()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as FileContent;
  return data;
}

export async function readFile(path: string): Promise<FileContent> {
  const base = getFilesBaseUrl();
  const url = `${base}/${encodePath(path)}?${studentQuerySuffix()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as FileContent;
  return data;
}

export async function saveFile(path: string, content: string): Promise<FileContent> {
  const base = getFilesBaseUrl();
  const url = `${base}/${encodePath(path)}?${studentQuerySuffix()}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as FileContent;
  return data;
}

export async function deleteFile(path: string): Promise<void> {
  const base = getFilesBaseUrl();
  const url = `${base}/${encodePath(path)}?${studentQuerySuffix()}`;
  const res = await fetch(url, { method: "DELETE", headers: headers() });
  if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
}

export async function renameFile(from: string, to: string): Promise<void> {
  const base = getFilesBaseUrl();
  const url = `${base}/rename?${studentQuerySuffix()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ from, to }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

function encodePath(p: string): string {
  // encode each segment but preserve /
  return p
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export function getCurrentStudentId(): string {
  return getStudentId();
}
