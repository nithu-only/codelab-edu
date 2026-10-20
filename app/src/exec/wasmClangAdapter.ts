/**
 * Main-thread adapter for the wasm-clang C/C++ worker.
 *
 * Cold runs are slow (clang ~31 MB + lld ~19 MB + sysroot ~9 MB on first use),
 * so the first run gets a long timeout; the persistent worker then keeps the
 * compiled modules in memory and warm runs use the standard timeout.
 */
import type { ExecRequest, ExecResult } from "../types";
import { createLocalEngine } from "./localWorkerEngine";

const engine = createLocalEngine({
  name: "C/C++",
  makeWorker: () => new Worker(new URL("./wasmClangWorker.ts", import.meta.url), { type: "module" }),
  coldRunTimeoutMs: 240_000,
});

export function executeWasmClang(req: ExecRequest, signal?: AbortSignal): Promise<ExecResult> {
  return engine(req, signal);
}
