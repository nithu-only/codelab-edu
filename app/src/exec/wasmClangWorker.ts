/**
 * Web Worker entry for the wasm-clang C/C++ toolchain.
 *
 * Fetches binji's shared.js once, evaluates it together with our harness
 * (single script so the harness can reference the shared.js `API` binding),
 * then handles run requests. Load failures are reported as engine-error so the
 * main thread can fall back to a remote provider.
 */
/// <reference lib="webworker" />
import { WASM_CLANG_CDN, WASM_CLANG_HARNESS_SOURCE, WASM_CLANG_SHARED_JS_URL } from "./wasmClangHarness";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage(msg: unknown): void;
};

interface ClangRequest {
  language: "c" | "cpp";
  code: string;
  stdin: string;
}

interface ClangResult {
  status: string;
  stdout: string;
  stderr: string;
  engineUnavailable?: boolean;
}

let harnessReady: Promise<void> | null = null;

function ensureHarness(): Promise<void> {
  if (harnessReady) return harnessReady;
  harnessReady = (async () => {
    const res = await fetch(WASM_CLANG_SHARED_JS_URL);
    if (!res.ok) {
      throw new Error(`failed to fetch shared.js (HTTP ${res.status})`);
    }
    const source = await res.text();
    // Indirect eval: shared.js's `const API` and our harness share one script
    // scope; the harness registers itself on globalThis.
    (0, eval)(`${source}\n${WASM_CLANG_HARNESS_SOURCE}`);
    const harness = (globalThis as { __codelabClangHarness?: unknown }).__codelabClangHarness;
    if (typeof harness !== "function") {
      throw new Error("wasm-clang harness failed to initialize");
    }
  })().catch((err) => {
    harnessReady = null; // allow a retry on the next run
    throw err;
  });
  return harnessReady;
}

ctx.onmessage = (e: MessageEvent) => {
  const { code, stdin, language } = e.data as ClangRequest;
  void (async () => {
    try {
      await ensureHarness();
    } catch (err) {
      ctx.postMessage({
        kind: "engine-error",
        message:
          `Could not load the in-browser C/C++ toolchain (${err instanceof Error ? err.message : String(err)}). ` +
          "It is downloaded from a CDN on first use — check your connection, " +
          "or configure a Judge0 provider to run C/C++ remotely instead (see README).",
      });
      return;
    }
    try {
      const harness = (globalThis as unknown as {
        __codelabClangHarness: (req: ClangRequest & { cdnBase: string }) => Promise<ClangResult>;
      }).__codelabClangHarness;
      const result = await harness({
        cdnBase: WASM_CLANG_CDN,
        language: language === "cpp" ? "cpp" : "c",
        code,
        stdin: stdin ?? "",
      });
      ctx.postMessage({ kind: "result", ...result });
    } catch (err) {
      ctx.postMessage({
        kind: "result",
        status: "ERROR",
        stdout: "",
        stderr: `C/C++ execution error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  })();
};

ctx.postMessage({ kind: "ready" });
