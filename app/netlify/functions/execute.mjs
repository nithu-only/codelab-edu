/**
 * Netlify Function: /api/execute
 *
 * Server-side proxy to a Judge0-compatible code execution API so that API
 * keys never reach the browser bundle. The frontend calls POST
 * /.netlify/functions/execute?wait=true (or /api/execute) with:
 *   { "language": "python" | "c" | "cpp" | "java" | "javascript",
 *     "sourceCode": "...", "stdin": "..." }
 * and receives Judge0-style JSON with PLAIN (decoded) stdout/stderr.
 *
 * Server-side environment variables (set them in the Netlify UI — NEVER in
 * VITE_ variables, which are inlined into the public bundle):
 *   JUDGE0_API_URL   base URL of the Judge0-compatible API (required to enable runs)
 *   JUDGE0_API_KEY   optional API key (sent as X-RapidAPI-Key when JUDGE0_API_HOST
 *                    is set, otherwise as an Authorization: Bearer token)
 *   JUDGE0_API_HOST  optional RapidAPI host header
 */

const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

const MAX_SOURCE_BYTES = 100_000;

const b64 = (s) => Buffer.from(String(s ?? ""), "utf8").toString("base64");
const unb64 = (s) => (s ? Buffer.from(s, "base64").toString("utf8") : "");

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function respond(statusCode, payload) {
  return {
    statusCode,
    headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Use POST with a JSON body." });
  }

  const baseUrl = (process.env.JUDGE0_API_URL || "").replace(/\/$/, "");
  if (!baseUrl) {
    // remote.ts maps 401/403 to a friendly NOT_CONFIGURED result in the UI.
    return respond(403, {
      error: "Execution provider not configured.",
      hint: "Set JUDGE0_API_URL (and optionally JUDGE0_API_KEY / JUDGE0_API_HOST) in Netlify → Site settings → Environment variables, then redeploy.",
    });
  }

  let payload;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "{}";
    payload = JSON.parse(raw);
  } catch {
    return respond(400, { error: "Request body must be valid JSON." });
  }

  const languageId = LANGUAGE_IDS[payload.language];
  if (!languageId) {
    return respond(400, {
      error: `Unsupported language: ${String(payload.language)}`,
      supported: Object.keys(LANGUAGE_IDS),
    });
  }

  const sourceCode = typeof payload.sourceCode === "string" ? payload.sourceCode : "";
  const stdin = typeof payload.stdin === "string" ? payload.stdin : "";
  if (!sourceCode.trim()) {
    return respond(400, { error: "sourceCode is required." });
  }
  if (Buffer.byteLength(sourceCode, "utf8") > MAX_SOURCE_BYTES) {
    return respond(413, { error: "Source code is too large (max 100 KB)." });
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const host = process.env.JUDGE0_API_HOST;
  const key = process.env.JUDGE0_API_KEY;
  if (host) headers["X-RapidAPI-Host"] = host;
  if (key) {
    if (host) headers["X-RapidAPI-Key"] = key;
    else headers["Authorization"] = `Bearer ${key}`;
  }

  const body = JSON.stringify({
    language_id: languageId,
    source_code: b64(sourceCode),
    stdin: b64(stdin),
    cpu_time_limit: 10,
    wall_time_limit: 15,
    max_file_size: 1024,
  });

  try {
    const url = `${baseUrl}/submissions?base64_encoded=true&wait=true`;
    const res = await fetch(url, { method: "POST", headers, body });

    const text = await res.text();
    if (res.status === 429) {
      return respond(429, { error: "Rate limit reached on the execution provider. Try again shortly." });
    }
    if (!res.ok) {
      return respond(res.status, {
        error: `Execution provider returned HTTP ${res.status}.`,
        detail: text.slice(0, 500),
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return respond(502, { error: "Execution provider returned invalid JSON.", detail: text.slice(0, 300) });
    }

    return respond(200, {
      status: data.status,
      stdout: unb64(data.stdout),
      stderr: unb64(data.stderr),
      compile_output: unb64(data.compile_output),
      message: unb64(data.message),
      time: data.time,
    });
  } catch (err) {
    return respond(502, {
      error: "Could not reach the execution provider.",
      detail: String(err).slice(0, 300),
    });
  }
}
