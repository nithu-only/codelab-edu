/**
 * Generates public/javaWorker.js — the classic Web Worker that runs Java via
 * CheerpJ — from scripts/javaWorker.template.js plus the CjRunner bridge source
 * below.
 *
 * Runs automatically via the `predev`/`prebuild` npm scripts, or manually:
 *   node scripts/gen-java-worker.mjs
 *
 * Why a generated plain-JS worker instead of a Vite-managed worker:
 *   - CheerpJ 4.3 does not work in ES-module workers (its loader calls
 *     importScripts(), which modules forbid). Vite's `?worker` is a module
 *     worker in dev, so in-browser Java would only work in a production build.
 *   - CheerpJ resolves the `/app/...` web root against the worker's location,
 *     so a blob:-URL worker cannot find /app/tools.jar.
 * A classic worker served from a real HTTP URL (public/) satisfies both and
 * behaves identically in dev and production.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");

/**
 * The bridge program compiled once per session with javac (from /app/tools.jar).
 * For each run it writes the user's source, drops stale .class files, runs javac
 * capturing diagnostics, finds the main class by reflection, redirects
 * System.out/err/in, invokes main, and writes captured streams to /files/__*.txt
 * for JavaScript to read back via cjFileBlob.
 *
 * Free of lambdas/var/diamond so it compiles under the Java 8 javac in
 * tools.jar. (Verified to also compile under modern JDKs.)
 */
const JAVA_RUNNER_SOURCE = `import java.io.*;
import java.lang.reflect.*;
import java.util.*;

public class CjRunner {
  static final String OUT = "/files/";

  public static void main(String[] args) throws Exception {
    List<String> sourceNames = new ArrayList<String>();
    Map<String, String> files = new LinkedHashMap<String, String>();
    String stdin = null;
    for (int i = 0; i < args.length; i++) {
      if (args[i].equals("--file")) {
        String name = args[++i];
        String content = (i + 1 < args.length) ? args[++i] : "";
        files.put(name, content);
        sourceNames.add(name);
      } else if (args[i].equals("--stdin")) {
        stdin = (i + 1 < args.length) ? args[++i] : "";
      }
    }

    for (Map.Entry<String, String> e : files.entrySet()) {
      writeFile(OUT + e.getKey(), e.getValue());
    }
    writeFile("/files/__out.txt", "");
    writeFile("/files/__err.txt", "");
    cleanClasses(new File("/files"));

    List<String> compileArgs = new ArrayList<String>();
    compileArgs.add("-d"); compileArgs.add(OUT);
    for (int i = 0; i < sourceNames.size(); i++) { compileArgs.add(OUT + sourceNames.get(i)); }

    ByteArrayOutputStream cerr = new ByteArrayOutputStream();
    PrintStream realErr = System.err, realOut = System.out;
    PrintStream cap = new PrintStream(cerr, true, "UTF-8");
    System.setErr(cap); System.setOut(cap);
    int rc;
    try {
      Class<?> javac = Class.forName("com.sun.tools.javac.Main");
      Method m = javac.getMethod("compile", String[].class);
      Object res = m.invoke(null, (Object) compileArgs.toArray(new String[0]));
      rc = ((Integer) res).intValue();
    } finally {
      System.setErr(realErr); System.setOut(realOut);
    }
    if (rc != 0) {
      writeFile("/files/__status.txt", "COMPILE_ERROR");
      writeFile("/files/__err.txt", cerr.toString("UTF-8"));
      System.exit(0);
    }

    String mainClass = findMainClass();
    if (mainClass == null) {
      writeFile("/files/__status.txt", "NO_MAIN");
      writeFile("/files/__err.txt", "No class with a public static void main(String[] args) method was found.");
      System.exit(0);
    }

    PrintStream out = new PrintStream(new FileOutputStream("/files/__out.txt"), true, "UTF-8");
    PrintStream err = new PrintStream(new FileOutputStream("/files/__err.txt"), true, "UTF-8");
    System.setOut(out);
    System.setErr(err);
    if (stdin != null) { System.setIn(new ByteArrayInputStream(stdin.getBytes("UTF-8"))); }

    Throwable thrown = null;
    try {
      Class<?> c = Class.forName(mainClass);
      Method main = c.getMethod("main", String[].class);
      main.setAccessible(true);
      main.invoke(null, (Object) new String[0]);
    } catch (InvocationTargetException e) {
      thrown = (e.getCause() != null) ? e.getCause() : e;
    } catch (Throwable t) {
      thrown = t;
    }
    if (thrown != null) { thrown.printStackTrace(err); }
    writeFile("/files/__status.txt", thrown == null ? "SUCCESS" : "RUNTIME_ERROR");
    out.flush(); err.flush();
    System.exit(0);
  }

  static void cleanClasses(File dir) {
    File[] fs = dir.listFiles();
    if (fs == null) { return; }
    for (int i = 0; i < fs.length; i++) {
      File f = fs[i];
      if (f.isDirectory()) { cleanClasses(f); }
      else if (f.getName().endsWith(".class") && !f.getName().equals("CjRunner.class")) { f.delete(); }
    }
  }

  static String findMainClass() {
    List<String> names = new ArrayList<String>();
    collect(new File("/files"), "", names);
    for (int i = 0; i < names.size(); i++) {
      String n = names.get(i);
      if (n.equals("CjRunner") || n.indexOf('$') >= 0) { continue; }
      try {
        Class<?> c = Class.forName(n, false, CjRunner.class.getClassLoader());
        Method m = c.getMethod("main", String[].class);
        int mods = m.getModifiers();
        if (Modifier.isStatic(mods) && Modifier.isPublic(mods)) { return n; }
      } catch (Throwable t) { }
    }
    return null;
  }

  static void collect(File dir, String prefix, List<String> out) {
    File[] files = dir.listFiles();
    if (files == null) { return; }
    for (int i = 0; i < files.length; i++) {
      File f = files[i];
      if (f.isDirectory()) { collect(f, prefix + f.getName() + ".", out); }
      else if (f.getName().endsWith(".class")) {
        out.add(prefix + f.getName().substring(0, f.getName().length() - 6));
      }
    }
  }

  static void writeFile(String path, String content) throws IOException {
    OutputStream os = new FileOutputStream(path);
    try { os.write(content.getBytes("UTF-8")); } finally { os.close(); }
  }
}`;

const CHEERPJ_VERSION = "4.3";
const LOADER_URL =
  process.env.VITE_CHEERPJ_LOADER ||
  `https://cjrtnc.leaningtech.com/${CHEERPJ_VERSION}/loader.js`;
const CLASSPATH = "/app/tools.jar:/files/";
const FILES_DIR = "/files/";

const template = readFileSync(path.join(here, "javaWorker.template.js"), "utf8");
// Function replacers are required: the Java source contains `indexOf('$')`, and a
// string replacement would treat `$'` as a special "text after match" pattern.
const out = template
  .replace("__CHEERPJ_LOADER_URL__", () => JSON.stringify(LOADER_URL))
  .replace("__JAVA_CLASSPATH__", () => JSON.stringify(CLASSPATH))
  .replace("__JAVA_FILES_DIR__", () => JSON.stringify(FILES_DIR))
  .replace("__JAVA_RUNNER_SOURCE__", () => JSON.stringify(JAVA_RUNNER_SOURCE));

const dest = path.join(root, "public", "javaWorker.js");
writeFileSync(dest, out);
console.log(`wrote ${path.relative(process.cwd(), dest)} (${out.length} bytes)`);
