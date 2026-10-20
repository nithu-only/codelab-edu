/**
 * Long-lived Web Worker engine manager for the in-browser runtimes
 * (Pyodide for Python, wasm-clang for C/C++, CheerpJ for Java).
 *
 * - Workers stay alive between runs so the downloaded interpreter/toolchain
 *   stays in memory (first run pays a large download; later runs are instant).
 * - Runs are serialized through a simple promise queue.
 * - A wall-clock timeout terminates the worker (kills infinite loops) and the
 *   next run transparently respawns a cold engine.
 * - Engine *load* failures are surfaced via ExecResult.engineUnavailable so the
 *   dispatcher can fall back to a remote provider; student-code failures are not.
 */
import type { ExecRequest, ExecResult } from "../types";
import { EXEC_TIMEOUT_MS, normalizeOutput, trimOutput } from "./adapter";

export interface LocalEngineOptions {
  /** Engine name used in messages, e.g. "Python" or "C/C++". */
  name: string;
  makeWorker: () => Worker;
  /** Timeout for the first run in a fresh worker (toolchain download/boot). */
  coldRunTimeoutMs?: number;
  /** Timeout for subsequent (warm) runs. Defaults to EXEC_TIMEOUT_MS. */
  warmRunTimeoutMs?: number;
}

interface WorkerMessage {
  kind: "ready" | "run" | "result" | "engine-error";
  status?: ExecResult["status"];
  stdout?: string;
  stderr?: string;
  message?: string;
  engineUnavailable?: boolean;
}

export function createLocalEngine(opts: LocalEngineOptions) {
  const coldTimeout = opts.coldRunTimeoutMs ?? 180_000;
  const warmTimeout = opts.warmRunTimeoutMs ?? EXEC_TIMEOUT_MS;

  let worker: Worker | null = null;
  let readyPromise: Promise<void> | null = null;
  let warmed = false;
  let deliver: ((m: WorkerMessage) => void) | null = null;
  let queueTail: Promise<unknown> = Promise.resolve();

  function reset() {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    readyPromise = null;
    deliver = null;
    warmed = false;
  }

  function ensureWorker(): Promise<void> {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise<void>((resolve, reject) => {
      let w: Worker;
      try {
        w = opts.makeWorker();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      worker = w;

      let readySettled = false;
      const loadTimer = setTimeout(() => {
        if (readySettled) return;
        readySettled = true;
        reset();
        reject(new Error(`${opts.name} engine worker did not start within ${coldTimeout / 1000}s`));
      }, coldTimeout);

      const failReady = (err: Error) => {
        if (readySettled) return;
        readySettled = true;
        clearTimeout(loadTimer);
        reset();
        reject(err);
      };

      w.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const m = e.data;
        if (m.kind === "ready") {
          if (!readySettled) {
            readySettled = true;
            clearTimeout(loadTimer);
            resolve();
          }
          return;
        }
        if (m.kind === "engine-error") {
          const msg = m.message || `${opts.name} engine failed`;
          if (!readySettled) {
            failReady(new Error(msg));
            return;
          }
          deliver?.({ ...m, kind: "result" });
          return;
        }
        if (m.kind === "result") {
          deliver?.(m);
        }
      };
      w.onerror = (e: ErrorEvent) => {
        const msg = e.message || `${opts.name} worker error`;
        if (!readySettled) {
          failReady(new Error(msg));
          return;
        }
        deliver?.({ kind: "result", status: "ERROR", stdout: "", stderr: msg });
      };
    });
    return readyPromise;
  }

  async function runNow(req: ExecRequest, signal?: AbortSignal): Promise<ExecResult> {
    const start = performance.now();
    try {
      await ensureWorker();
    } catch (err) {
      return {
        status: "ERROR",
        stdout: "",
        stderr: `Could not start the in-browser ${opts.name} engine: ${err instanceof Error ? err.message : String(err)}`,
        engineUnavailable: true,
        timeMs: Math.round(performance.now() - start),
      };
    }

    const timeoutMs = warmed ? warmTimeout : coldTimeout;

    return new Promise<ExecResult>((resolve) => {
      let settled = false;
      const finish = (r: ExecResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        deliver = null;
        signal?.removeEventListener("abort", onAbort);
        resolve(r);
      };

      const onAbort = () => {
        reset();
        finish({
          status: "ERROR",
          stdout: "",
          stderr: "Run aborted.",
          timeMs: Math.round(performance.now() - start),
        });
      };

      const timer = setTimeout(() => {
        // The worker may be stuck in an infinite loop — kill and respawn cold.
        reset();
        finish({
          status: "TIMEOUT",
          stdout: "",
          stderr: `[${opts.name} execution timed out after ${Math.round(timeoutMs / 1000)}s — engine restarted]`,
          timeMs: timeoutMs,
        });
      }, timeoutMs);

      if (signal?.aborted) {
        onAbort();
        return;
      }
      signal?.addEventListener("abort", onAbort, { once: true });

      deliver = (m) => {
        if (m.engineUnavailable) {
          // Engine infra failed to load — discard this worker so the next run
          // starts from a clean (cold) instance instead of a half-initialized one.
          reset();
        } else {
          warmed = true;
        }
        finish({
          status: m.status ?? "ERROR",
          stdout: trimOutput(normalizeOutput(m.stdout ?? "")),
          stderr: trimOutput(normalizeOutput(m.stderr ?? "")),
          engineUnavailable: m.engineUnavailable,
          timeMs: Math.round(performance.now() - start),
        });
      };

      worker?.postMessage({ kind: "run", language: req.language, code: req.code, stdin: req.stdin });
    });
  }

  return function executeLocal(req: ExecRequest, signal?: AbortSignal): Promise<ExecResult> {
    const run = queueTail.then(
      () => runNow(req, signal),
      () => runNow(req, signal),
    );
    queueTail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
}
