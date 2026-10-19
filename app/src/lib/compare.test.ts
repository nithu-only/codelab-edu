import { describe, expect, it } from "vitest";
import { normalizeForCompare, outputsMatch } from "./compare";

describe("normalizeForCompare", () => {
  it("ignores CRLF line endings", () => {
    expect(normalizeForCompare("a\r\nb")).toBe("a\nb");
  });

  it("ignores trailing whitespace per line", () => {
    expect(normalizeForCompare("a  \nb\t\n")).toBe("a\nb");
  });

  it("ignores leading and trailing blank lines", () => {
    expect(normalizeForCompare("\n\n  \na\nb\n\n")).toBe("a\nb");
  });

  it("keeps meaningful internal spacing", () => {
    expect(normalizeForCompare("a  b")).toBe("a  b");
  });

  it("keeps case and internal content intact", () => {
    expect(normalizeForCompare("Hello")).not.toBe("hello");
  });

  it("handles empty strings", () => {
    expect(normalizeForCompare("")).toBe("");
    expect(normalizeForCompare("\n  \n")).toBe("");
  });
});

describe("outputsMatch", () => {
  it("matches equivalent outputs", () => {
    expect(outputsMatch("1 2 3 \r\n", "1 2 3")).toBe(true);
    expect(outputsMatch("10\n20\n", "10\n20")).toBe(true);
  });

  it("rejects different outputs", () => {
    expect(outputsMatch("10", "20")).toBe(false);
    expect(outputsMatch("1 2", "12")).toBe(false);
    expect(outputsMatch("pass\nfail", "fail\npass")).toBe(false);
  });

  it("rejects one-line-shifted outputs", () => {
    expect(outputsMatch("a\nb\nc", "a\nc\nb")).toBe(false);
  });
});
