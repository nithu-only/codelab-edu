/**
 * C/C++ in the browser via Clang/LLD compiled to WebAssembly.
 *
 * Uses the toolchain from the binji/wasm-clang project (Apache-2.0):
 *   https://github.com/binji/wasm-clang   (demo: https://binji.github.io/wasm-clang)
 * Assets (clang, lld, memfs, sysroot.tar, shared.js) are fetched from the
 * GitHub Pages CDN on first use (~60 MB total, cached by the browser and kept
 * in memory by the persistent worker for later runs).
 *
 * WASM_CLANG_HARNESS_SOURCE is plain JS evaluated next to binji's shared.js
 * inside the worker — and also under Node in the integration tests — so the
 * exact same compile+run path is verified in both environments.
 */

/** Overridable via VITE_WASM_CLANG_CDN (must mirror binji.github.io/wasm-clang/). */
export const WASM_CLANG_CDN = (
  (import.meta.env?.VITE_WASM_CLANG_CDN as string | undefined) || "https://binji.github.io/wasm-clang/"
).replace(/\/?$/, "/");

export const WASM_CLANG_SHARED_JS_URL = `${WASM_CLANG_CDN}shared.js`;

export const WASM_CLANG_HARNESS_SOURCE = String.raw`
(function () {
  function stripAnsi(s) { return s.replace(/\x1b\[[0-9;]*m/g, ""); }

  var state = { base: null, api: null, mode: "log", phase: "compile", log: "", out: "", cmd: "", report: "" };

  function makeApi(base) {
    var st = state;
    var options = {
      readBuffer: async function (filename) {
        var r = await fetch(st.base + filename);
        if (!r.ok) throw new Error("Failed to fetch " + filename + " (HTTP " + r.status + ")");
        return r.arrayBuffer();
      },
      compileStreaming: async function (filename) {
        var r = await fetch(st.base + filename);
        if (!r.ok) throw new Error("Failed to fetch " + filename + " (HTTP " + r.status + ")");
        return WebAssembly.compile(await r.arrayBuffer());
      },
      hostWrite: function (s) {
        if (st.mode === "stdout") st.out += s; else st.log += s;
      },
    };
    var api = new API(options);
    // binji's runner echoes progress ("Fetching and compiling clang... done."),
    // command lines and timing through hostLog/hostLogAsync/hostWrite. None of it
    // is useful to a student, so route it all into the throwaway cmd bucket and
    // leave the log bucket for compiler diagnostics only.
    api.hostLog = function (message) { st.cmd += message; };
    api.hostLogAsync = function (message, promise) {
      st.cmd += message + "... ";
      return promise.then(function (result) { st.cmd += "done.\n"; return result; });
    };
    return api;
  }

  globalThis.__codelabClangHarness = async function (request) {
    var st = state;
    if (!st.api || st.base !== request.cdnBase) {
      st.base = request.cdnBase;
      st.api = makeApi(request.cdnBase);
      st.mode = "log";
      st.log = "";
      st.out = "";
      await st.api.ready; // loads memfs.wasm and untars sysroot.tar
    }
    var api = st.api;
    api.memfs.setStdinStr(request.stdin || "");

    var isCpp = request.language === "cpp";
    st.mode = "log";
    st.phase = "compile";
    st.report = "";
    var logMark = st.log.length;
    var outMark = st.out.length;

    try {
      var input = isCpp ? "test.cpp" : "test.c";
      var obj = "test.o";
      var wasm = "test.wasm";

      api.memfs.addFile(input, request.code);
      var clang = await api.getModule(api.clangFilename);
      await api.run(
        clang, "clang", "-cc1", "-emit-obj",
        ...api.clangCommonArgs, "-O2", "-o", obj,
        "-x", isCpp ? "c++" : "c", input);
      await api.link(obj, wasm);

      var buffer = api.memfs.getFileContents(wasm);
      var mod = await WebAssembly.compile(buffer);

      st.mode = "stdout";
      st.phase = "run";
      try {
        await api.run(mod, wasm);
      } catch (runExn) {
        // App.run writes its crash report through hostWrite; pull it out of the
        // program-output stream and surface it as stderr instead.
        var markerIdx = st.out.lastIndexOf("\x1b[91mError: ");
        if (markerIdx >= outMark) {
          st.report = st.out.slice(markerIdx);
          st.out = st.out.slice(0, markerIdx);
        }
        throw runExn;
      } finally {
        st.mode = "log";
      }

      var programOut = st.out.slice(outMark);
      // api.run appends exactly one "\n" after a clean exit.
      if (programOut.charAt(programOut.length - 1) === "\n") programOut = programOut.slice(0, -1);
      return {
        status: "SUCCESS",
        stdout: programOut,
        // API.run appends a bare "\n" per stage, so trim outer blank lines;
        // anything left is a real compiler warning.
        stderr: stripAnsi(st.log.slice(logMark)).trim(),
      };
    } catch (exn) {
      var msg = exn && exn.message ? exn.message : String(exn);
      if (msg.indexOf("Failed to fetch") === 0) {
        return {
          status: "ERROR",
          stdout: "",
          stderr: msg + " — the C/C++ toolchain is fetched from a CDN on first use; " +
            "check your connection or configure a Judge0 provider (see README).",
          engineUnavailable: true,
        };
      }
      var logPart = stripAnsi(st.log.slice(logMark));
      if (st.phase === "run") {
        var report = stripAnsi(st.report).trim();
        return {
          status: "RUNTIME_ERROR",
          stdout: st.out.slice(outMark),
          stderr: report || ("Runtime error: " + msg),
        };
      }
      var text = logPart.trim() || msg;
      return { status: "COMPILE_ERROR", stdout: "", stderr: text };
    }
  };
})();
`;
