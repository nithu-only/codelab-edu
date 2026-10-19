/**
 * Output comparison for sample tests.
 *
 * Deliberately forgiving about whitespace: trailing spaces on a line, CRLF
 * endings and leading/trailing blank lines are ignored — but the actual
 * content of each line must match exactly (no case folding, no reordering).
 */
import type { ExecRequest, ExecResult, TestCase } from "../types";
import { execute } from "../exec";

export function normalizeForCompare(s: string): string {
  const lines = s.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, ""));
  while (lines.length > 0 && lines[0] === "") lines.shift();
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalizeForCompare(actual) === normalizeForCompare(expected);
}

export interface SampleResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  actualError: string;
  passed: boolean;
  skipped: boolean;
}

/** Runs every sample test for a problem and returns per-test verdicts. */
export async function runSamples(
  language: ExecRequest["language"],
  code: string,
  samples: TestCase[],
): Promise<SampleResult[]> {
  const results: SampleResult[] = [];
  for (const sample of samples) {
    const res: ExecResult = await execute({ language, code, stdin: sample.input });
    const ok = res.status === "SUCCESS";
    results.push({
      input: sample.input,
      expectedOutput: sample.expectedOutput,
      actualOutput: res.stdout,
      actualError: res.stderr,
      passed: ok && outputsMatch(res.stdout, sample.expectedOutput),
      skipped: !ok,
    });
  }
  return results;
}
