/**
 * Browser-side JavaScript execution in a dedicated Web Worker.
 *
 * Limitations (documented, NOT a security sandbox):
 * - The worker has no DOM access, which prevents the most common damage,
 *   but a determined attacker could still use network APIs from the worker.
 * - A wall-clock timeout terminates the worker, which stops infinite loops.
 * - Student code must never be eval()'d in the main window.
 */
import type { ExecRequest, ExecResult } from "../types";
import { EXEC_TIMEOUT_MS, normalizeOutput, trimOutput } from "./adapter";

interface WorkerResponse {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function buildWorkerSource(): string {
  // Runs inside the worker: captures console output, executes code, reports back.
  return `
var __out = [];
function __fmt(v) {
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.stack || v.message;
  try { return JSON.stringify(v, null, 0); } catch (e) { return String(v); }
}
var console = {
  log: function() { __out.push(Array.prototype.map.call(arguments, __fmt).join(" ")); },
  info: function() { __out.push(Array.prototype.map.call(arguments, __fmt).join(" ")); },
  warn: function() { __out.push(Array.prototype.map.call(arguments, __fmt).join(" ")); },
  error: function() { __out.push(Array.prototype.map.call(arguments, __fmt).join(" ")); },
  debug: function() { __out.push(Array.prototype.map.call(arguments, __fmt).join(" ")); }
};
self.onmessage = function (e) {
  var code = e.data.code;
  try {
    var fn = new Function("console", "__stdin", code);
    fn(console, e.data.stdin || "");
    self.postMessage({ ok: true, stdout: __out.join("\\n"), stderr: "" });
  } catch (err) {
    self.postMessage({
      ok: false,
      stdout: __out.join("\\n"),
      stderr: (err && (err.stack || err.message)) ? String(err.stack || err.message) : String(err)
    });
  }
};
`;
}

export function executeInWorker(req: ExecRequest): Promise<ExecResult> {
  const start = performance.now();
  return new Promise((resolve) => {
    let worker: Worker;
    let objectUrl = "";
    try {
      const blob = new Blob([buildWorkerSource()], { type: "text/javascript" });
      objectUrl = URL.createObjectURL(blob);
      worker = new Worker(objectUrl);
    } catch (err) {
      resolve({
        status: "ERROR",
        stdout: "",
        stderr: `Could not start JavaScript worker: ${String(err)}`,
      });
      return;
    }

    let settled = false;
    const finish = (r: ExecResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(r);
    };

    const timer = setTimeout(() => {
      finish({
        status: "TIMEOUT",
        stdout: "",
        stderr: `[Execution timed out after ${EXEC_TIMEOUT_MS / 1000}s — worker terminated]`,
        timeMs: EXEC_TIMEOUT_MS,
      });
    }, EXEC_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;
      finish({
        status: data.ok ? "SUCCESS" : "RUNTIME_ERROR",
        stdout: trimOutput(normalizeOutput(data.stdout)),
        stderr: trimOutput(normalizeOutput(data.stderr)),
        timeMs: Math.round(performance.now() - start),
      });
    };
    worker.onerror = (e) => {
      finish({
        status: "RUNTIME_ERROR",
        stdout: "",
        stderr: trimOutput(normalizeOutput(e.message || "Unknown worker error")),
        timeMs: Math.round(performance.now() - start),
      });
    };

    // Student code can read stdin via __stdin (or input() helper injected in the wrapper).
    const prelude = `function input(){ return __stdin; }\nfunction __readAll(){ return __stdin; }\n`;
    worker.postMessage({ code: prelude + req.code, stdin: req.stdin });
  });
}
