/**
 * Integration test for the in-browser C/C++ toolchain (binji/wasm-clang).
 *
 * Requires network access — it downloads clang (~31 MB), lld (~19 MB) and the
 * sysroot (~9 MB) from binji.github.io on first run. Skipped by default so
 * `npm test` stays fast/offline; run explicitly with:
 *
 *   NET_TESTS=1 npm test        (bash: NET_TESTS=1 npx vitest run)
 */
import { beforeAll, describe, expect, it } from "vitest";
import { WASM_CLANG_CDN, WASM_CLANG_HARNESS_SOURCE, WASM_CLANG_SHARED_JS_URL } from "./wasmClangHarness";
import { getPath } from "../data/content";
import { outputsMatch } from "../lib/compare";
import type { LanguageId } from "../types";

interface ClangResult {
  status: string;
  stdout: string;
  stderr: string;
  engineUnavailable?: boolean;
}

type Harness = (req: {
  cdnBase: string;
  language: "c" | "cpp";
  code: string;
  stdin: string;
}) => Promise<ClangResult>;

const runNetworkTests = process.env.NET_TESTS === "1";

describe.skipIf(!runNetworkTests)("wasm-clang engine (network integration)", () => {
  let harness: Harness;

  beforeAll(async () => {
    const sharedRes = await fetch(WASM_CLANG_SHARED_JS_URL);
    expect(sharedRes.ok, `fetch ${WASM_CLANG_SHARED_JS_URL}`).toBe(true);
    const source = await sharedRes.text();
    (0, eval)(`${source}\n${WASM_CLANG_HARNESS_SOURCE}`);
    harness = (globalThis as unknown as { __codelabClangHarness: Harness }).__codelabClangHarness;
    expect(typeof harness).toBe("function");
  }, 120_000);

  it("compiles and runs a C hello world", async () => {
    const r = await harness({
      cdnBase: WASM_CLANG_CDN,
      language: "c",
      code: `#include <stdio.h>\nint main(void) { printf("42\\n"); return 0; }`,
      stdin: "",
    });
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("42\n");
    expect(r.stderr).toBe(""); // no toolchain echoes, progress messages or stray blank lines
  }, 300_000);

  it("feeds stdin to scanf", async () => {
    const r = await harness({
      cdnBase: WASM_CLANG_CDN,
      language: "c",
      code: `#include <stdio.h>\nint main(void) { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a + b); return 0; }`,
      stdin: "5 7\n",
    });
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("12\n");
  }, 60_000);

  it("compiles and runs a C++ iostream program", async () => {
    const r = await harness({
      cdnBase: WASM_CLANG_CDN,
      language: "cpp",
      code: `#include <iostream>\nint main() { std::cout << "cpp-ok" << std::endl; return 0; }`,
      stdin: "",
    });
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("cpp-ok\n");
  }, 60_000);

  it("reports compile errors as COMPILE_ERROR with diagnostics", async () => {
    const r = await harness({
      cdnBase: WASM_CLANG_CDN,
      language: "c",
      code: `int main(void) { notAThing(); return 0; }`,
      stdin: "",
    });
    expect(r.status).toBe("COMPILE_ERROR");
    expect(r.stderr).toContain("error:");
  }, 60_000);

  it("shows real compiler warnings but none of the toolchain noise", async () => {
    const r = await harness({
      cdnBase: WASM_CLANG_CDN,
      language: "c",
      code: `int main(void) { printf("ok\\n"); return 0; }`, // no #include -> implicit-declaration warning
      stdin: "",
    });
    expect(r.status).toBe("SUCCESS");
    expect(r.stdout).toBe("ok\n");
    expect(r.stderr).toContain("warning:");
    expect(r.stderr).not.toContain("done.");
    expect(r.stderr).not.toContain("> clang");
  }, 300_000);

  it("reports runtime crashes as RUNTIME_ERROR", async () => {
    const r = await harness({
      cdnBase: WASM_CLANG_CDN,
      language: "c",
      code: `#include <stdio.h>\nint main(void) { int *p = 0; *p = 1; printf("unreachable\\n"); return 0; }`,
      stdin: "",
    });
    expect(r.status).toBe("RUNTIME_ERROR");
    expect(r.stdout).toBe("");
  }, 60_000);

  for (const lang of ["c", "cpp"] as LanguageId[]) {
    it(`runs every ${lang === "c" ? "C" : "C++"} curriculum lesson example as documented`, async () => {
      const pathObj = getPath(lang);
      let count = 0;
      for (const topic of pathObj.topics) {
        for (const lesson of topic.lessons) {
          const r = await harness({
            cdnBase: WASM_CLANG_CDN,
            language: lang as "c" | "cpp",
            code: lesson.exampleCode,
            stdin: lesson.exampleStdin,
          });
          expect(r.status, `${lesson.id} status: ${r.stderr}`).toBe("SUCCESS");
          expect(outputsMatch(r.stdout, lesson.exampleOutput), `${lesson.id} stdout: ${JSON.stringify(r.stdout)}`).toBe(true);
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(9);
    }, 600_000);
  }
});
