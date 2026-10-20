/*
 * Java (CheerpJ) worker template.
 *
 * This is a *classic* worker (not an ES module) served from a real HTTP URL at
 * public/javaWorker.js. That is required because:
 *   - CheerpJ 4.3 does NOT work in module workers (its loader calls
 *     importScripts(), which is disallowed there).
 *   - CheerpJ resolves the `/app/...` web root against the worker's own
 *     location, so a blob:-URL worker cannot find /app/tools.jar.
 * A classic worker served over HTTP satisfies both.
 *
 * Generated into public/javaWorker.js by scripts/gen-java-worker.mjs.
 * Do not edit the generated file — edit this template or the generator.
 */

var CHEERPJ_LOADER_URL = __CHEERPJ_LOADER_URL__;
var JAVA_CLASSPATH = __JAVA_CLASSPATH__;
var JAVA_FILES_DIR = __JAVA_FILES_DIR__;
var JAVA_RUNNER_SOURCE = __JAVA_RUNNER_SOURCE__;

var logs = [];
var origLog = console.log;
var origErr = console.error;
function rec(kind, args) {
  try {
    logs.push(kind + " " + Array.prototype.slice.call(args).map(String).join(" "));
    if (logs.length > 30) logs.shift();
  } catch (e) {}
}
console.log = function () { rec("LOG", arguments); origLog.apply(console, arguments); };
console.error = function () { rec("ERR", arguments); origErr.apply(console, arguments); };

var enc = new TextEncoder();
var dec = new TextDecoder();

function addStringFile(path, text) {
  var write = self.cheerpOSAddStringFile || self.cheerpjAddStringFile;
  if (!write) throw new Error("CheerpJ string-file API is unavailable");
  write(path, enc.encode(text));
}

function readFileText(path) {
  if (!self.cjFileBlob) return Promise.resolve("");
  try {
    return self.cjFileBlob(path).then(function (blob) {
      return blob.arrayBuffer().then(function (buf) { return dec.decode(new Uint8Array(buf)); });
    }).catch(function () { return ""; });
  } catch (e) {
    return Promise.resolve("");
  }
}

var runnerReady = null;

function ensureRunner() {
  if (!runnerReady) {
    runnerReady = (async function () {
      self.importScripts(CHEERPJ_LOADER_URL);
      if (typeof self.cheerpjInit !== "function") throw new Error("CheerpJ loader did not initialize");
      await self.cheerpjInit({ status: "none" });
      if (typeof self.cheerpjRunMain !== "function") throw new Error("CheerpJ runtime did not expose cheerpjRunMain");
      addStringFile("/str/CjRunner.java", JAVA_RUNNER_SOURCE);
      var rc = await self.cheerpjRunMain(
        "com.sun.tools.javac.Main",
        JAVA_CLASSPATH,
        "/str/CjRunner.java",
        "-d",
        JAVA_FILES_DIR
      );
      if (typeof rc === "number" && rc !== 0) throw new Error("in-browser Java bridge failed to compile (rc=" + rc + ")");
    })().catch(function (err) {
      runnerReady = null;
      throw err;
    });
  }
  return runnerReady;
}

function mapStatus(status) {
  if (status === "SUCCESS") return "SUCCESS";
  if (status === "COMPILE_ERROR") return "COMPILE_ERROR";
  return "RUNTIME_ERROR";
}

function deriveFileName(code) {
  var pub = code.match(/public\s+(?:final\s+|abstract\s+)?(?:class|interface|enum)\s+([A-Za-z_$][\w$]*)/);
  if (pub) return pub[1] + ".java";
  var any = code.match(/(?:^|\n)\s*(?:final\s+|abstract\s+)?(?:class|interface|enum)\s+([A-Za-z_$][\w$]*)/);
  return any ? any[1] + ".java" : "Main.java";
}

self.onmessage = function (e) {
  var code = e.data.code;
  var stdin = e.data.stdin || "";
  ensureRunner().then(function () {
    var fileName = deriveFileName(code);
    return self.cheerpjRunMain("CjRunner", JAVA_CLASSPATH, "--file", fileName, code, "--stdin", stdin).then(function () {
      return Promise.all([
        readFileText("/files/__status.txt"),
        readFileText("/files/__out.txt"),
        readFileText("/files/__err.txt"),
      ]);
    }).then(function (parts) {
      self.postMessage({ kind: "result", status: mapStatus(parts[0].trim()), stdout: parts[1], stderr: parts[2] });
    });
  }).catch(function (err) {
    self.postMessage({
      kind: "result",
      status: "ERROR",
      stdout: "",
      stderr:
        "Could not load the in-browser Java engine (" + (err && err.message ? err.message : String(err)) + "). " +
        "The CheerpJ runtime and javac are downloaded on first use — check your connection, " +
        "or configure a Judge0 provider to run Java remotely instead (see README). " +
        "Engine log: " + logs.join(" | "),
      engineUnavailable: true,
    });
  });
};

self.postMessage({ kind: "ready" });
