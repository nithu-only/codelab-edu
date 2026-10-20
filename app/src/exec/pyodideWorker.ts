/**
 * Web Worker entry for Pyodide. Loads the interpreter lazily on the first run
 * and keeps it for subsequent runs; reports load failures as engine-error so
 * the main thread can fall back to a remote provider.
 */
/// <reference lib="webworker" />
import { loadPyodideBrowser, runWithPyodideInstance, type PyodideLike } from "./pyodideCore";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage(msg: unknown): void;
};

let pyPromise: Promise<PyodideLike> | null = null;

function getPy(): Promise<PyodideLike> {
  if (!pyPromise) {
    pyPromise = loadPyodideBrowser().catch((err) => {
      pyPromise = null; // allow a retry on the next run
      throw err;
    });
  }
  return pyPromise;
}

ctx.onmessage = (e: MessageEvent) => {
  const { code, stdin } = e.data as { code: string; stdin: string };
  void (async () => {
    let py: PyodideLike;
    try {
      py = await getPy();
    } catch (err) {
      ctx.postMessage({
        kind: "engine-error",
        message:
          `Could not load Pyodide (${err instanceof Error ? err.message : String(err)}). ` +
          "The Python interpreter is downloaded from a CDN on first use — check your connection, " +
          "or configure a Judge0 provider to run Python remotely instead (see README).",
      });
      return;
    }
    const result = runWithPyodideInstance(py, code, stdin ?? "");
    ctx.postMessage({ kind: "result", ...result });
  })();
};

ctx.postMessage({ kind: "ready" });
