/**
 * Python execution via the real Pyodide interpreter (loaded from node_modules,
 * so this suite is fully offline after `npm install`).
 *
 * Runs every Python lesson example from the curriculum against the engine and
 * checks stdin handling, error mapping, and namespace isolation.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide } from "pyodide";
import path from "node:path";
import { runWithPyodideInstance, type PyodideLike } from "./pyodideCore";
import { getPath } from "../data/content";

// pyodide expects a URL-ish base; on disk this is just the package directory.
const indexURL = path.resolve("node_modules", "pyodide").replace(/\\/g, "/") + "/";

let py: PyodideLike;

describe("Pyodide engine (Node)", () => {
  beforeAll(async () => {
    py = (await loadPyodide({ indexURL })) as unknown as PyodideLike;
  }, 120_000);

  it("runs a hello world", () => {
    const r = runWithPyodideInstance(py, `print("hello")`, "");
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("hello\n");
  });

  it("reads multiple input() lines from stdin", () => {
    const r = runWithPyodideInstance(
      py,
      `a = int(input())\nb = int(input())\nprint(a + b)`,
      "5\n7\n",
    );
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("12\n");
  });

  it("prints an input() prompt to stdout", () => {
    const r = runWithPyodideInstance(py, `name = input("Who? ")\nprint("hi", name)`, "Ada\n");
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("Who? hi Ada\n");
  });

  it("maps runtime errors to RUNTIME_ERROR with a traceback", () => {
    const r = runWithPyodideInstance(py, `print("before")\nraise ValueError("boom")`, "");
    expect(r.status).toBe("RUNTIME_ERROR");
    expect(r.stdout).toBe("before\n");
    expect(r.stderr).toContain("ValueError: boom");
  });

  it("maps syntax errors to RUNTIME_ERROR", () => {
    const r = runWithPyodideInstance(py, `def broken(:\n    pass`, "");
    expect(r.status).toBe("RUNTIME_ERROR");
    expect(r.stderr).toContain("SyntaxError");
  });

  it("EOFError when stdin runs out", () => {
    const r = runWithPyodideInstance(py, `input()`, "");
    expect(r.status).toBe("RUNTIME_ERROR");
    expect(r.stderr).toContain("EOFError");
  });

  it("does not leak globals between runs", () => {
    runWithPyodideInstance(py, `secret = 123`, "");
    const r = runWithPyodideInstance(py, `print(secret)`, "");
    expect(r.status).toBe("RUNTIME_ERROR");
    expect(r.stderr).toContain("NameError");
  });

  it("runs every Python curriculum lesson example exactly as documented", async () => {
    const pathObj = getPath("python");
    const noFinalNewline = (s: string) => s.replace(/\n+$/, "");
    let count = 0;
    for (const topic of pathObj.topics) {
      for (const lesson of topic.lessons) {
        const r = runWithPyodideInstance(py, lesson.exampleCode, lesson.exampleStdin);
        expect(r.status, `${lesson.id} status`).toBe("SUCCESS");
        // Lesson docs omit the final newline that print() appends; compare like the grader does.
        expect(noFinalNewline(r.stdout), `${lesson.id} stdout`).toBe(noFinalNewline(lesson.exampleOutput));
        count++;
      }
    }
    expect(count).toBeGreaterThanOrEqual(8);
  });
});
