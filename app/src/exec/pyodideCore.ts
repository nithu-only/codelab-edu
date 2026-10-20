/**
 * In-browser Python execution via Pyodide (CPython compiled to WebAssembly).
 *
 * The interpreter is loaded inside a Web Worker (pyodideWorker.ts) so infinite
 * loops can be terminated and the UI never freezes. Output is captured with a
 * Python-side redirect (contextlib.redirect_stdout) rather than Pyodide's
 * stdout hooks, so formatting is exact and version-independent.
 *
 * This module is shared between the worker and the Node-based unit tests
 * (the tests load the same Pyodide version from node_modules).
 */
import type { ExecResult } from "../types";

/** Must match the pinned `pyodide` version in package.json exactly. */
export const PYODIDE_VERSION = "0.29.5";

/** CDN used in the browser; kept in sync with the npm pin above. */
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/**
 * Python driver executed on every run:
 *  - installs an input() that reads from the provided stdin string,
 *  - redirects stdout/stderr into StringIO buffers,
 *  - exec()s the student code in a fresh {"__name__": "__main__"} namespace,
 *  - stores (status, stdout, stderr) in the RESULT global.
 */
export const PYODIDE_DRIVER_SOURCE = `
import builtins, sys, io, contextlib, traceback

__lines = iter((__cb_stdin or "").splitlines())

def __input(prompt=""):
    sys.stdout.write(str(prompt))
    try:
        return next(__lines)
    except StopIteration:
        raise EOFError("EOF when reading a line")

builtins.input = __input

__out = io.StringIO()
__err = io.StringIO()
__status = "ok"
__tb = ""

with contextlib.redirect_stdout(__out), contextlib.redirect_stderr(__err):
    try:
        exec(compile(__cb_code, "<student>", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException:
        __status = "error"
        __tb = traceback.format_exc()

RESULT = [__status, __out.getvalue(), __err.getvalue() + __tb]
`;

export interface PyodideLike {
  globals: {
    set(key: string, value: unknown): void;
    get(key: string): unknown;
  };
  runPython(src: string): unknown;
}

interface ResultList {
  toJs(): unknown;
}

export function runWithPyodideInstance(
  py: PyodideLike,
  code: string,
  stdin: string,
): ExecResult {
  try {
    py.globals.set("__cb_code", code);
    py.globals.set("__cb_stdin", stdin ?? "");
    py.runPython(PYODIDE_DRIVER_SOURCE);
    const result = py.globals.get("RESULT") as ResultList | undefined;
    const arr = result && typeof result.toJs === "function" ? (result.toJs() as unknown[]) : null;
    if (!Array.isArray(arr) || arr.length !== 3) {
      return { status: "ERROR", stdout: "", stderr: "Python driver produced no result." };
    }
    const [status, stdout, stderr] = arr as [string, string, string];
    return {
      status: status === "ok" ? "SUCCESS" : "RUNTIME_ERROR",
      stdout: stdout ?? "",
      stderr: stderr ?? "",
    };
  } catch (err) {
    return {
      status: "ERROR",
      stdout: "",
      stderr: `Python engine error: ${err instanceof Error ? err.message : String(err)}`,
      engineUnavailable: true,
    };
  }
}

export async function loadPyodideBrowser(): Promise<PyodideLike> {
  // Loaded from the CDN at runtime (not bundled): the Pyodide distribution is
  // tens of MB and ships its own .wasm and stdlib assets.
  const mod = (await import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`)) as {
    loadPyodide: (cfg: { indexURL: string }) => Promise<PyodideLike>;
  };
  return mod.loadPyodide({ indexURL: PYODIDE_CDN });
}
