/**
 * Main-thread adapter for the Pyodide worker. See localWorkerEngine.ts for
 * timeout/queue/respawn behaviour.
 */
import type { ExecRequest, ExecResult } from "../types";
import { createLocalEngine } from "./localWorkerEngine";

const engine = createLocalEngine({
  name: "Python",
  makeWorker: () => new Worker(new URL("./pyodideWorker.ts", import.meta.url), { type: "module" }),
  coldRunTimeoutMs: 180_000,
});

export function executePyodide(req: ExecRequest, signal?: AbortSignal): Promise<ExecResult> {
  return engine(req, signal);
}
