// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  completeTopic,
  deleteProgram,
  getDraft,
  getProgress,
  getProgram,
  getTheme,
  listPrograms,
  saveProgram,
  setDraft,
  setTheme,
  solveProblem,
  visitTopic,
} from "./storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("saved programs", () => {
  it("saves, lists, updates and deletes programs", () => {
    expect(listPrograms()).toHaveLength(0);

    const a = saveProgram({ name: "Hello", language: "python", code: "print(1)", stdin: "" });
    const b = saveProgram({ name: "Loop", language: "c", code: "int main(){}", stdin: "3" });
    expect(listPrograms()).toHaveLength(2);
    expect(listPrograms().map((p) => p.name)).toContain("Hello");
    expect(getProgram(a.id)?.code).toBe("print(1)");

    // Saving with an existing id updates in place (no duplicate).
    saveProgram({ id: a.id, name: "Hello v2", language: "python", code: "print(2)", stdin: "" });
    expect(listPrograms()).toHaveLength(2);
    expect(getProgram(a.id)?.name).toBe("Hello v2");

    deleteProgram(b.id);
    expect(listPrograms()).toHaveLength(1);
    expect(getProgram(b.id)).toBeUndefined();
  });

  it("sorts programs by most recently updated first", async () => {
    const a = saveProgram({ name: "A", language: "python", code: "", stdin: "" });
    await new Promise((r) => setTimeout(r, 5));
    saveProgram({ name: "B", language: "sql", code: "", stdin: "" });
    expect(listPrograms()[0].name).toBe("B");
    expect(listPrograms()[1].id).toBe(a.id);
  });
});

describe("drafts", () => {
  it("stores a draft per language", () => {
    expect(getDraft("python")).toBeUndefined();
    setDraft("python", "print('x')", "in");
    setDraft("sql", "SELECT 1;", "");
    expect(getDraft("python")).toEqual({ code: "print('x')", stdin: "in" });
    expect(getDraft("sql")?.code).toBe("SELECT 1;");
    expect(getDraft("c")).toBeUndefined();
  });
});

describe("progress", () => {
  it("completes topics once and records the last visited topic", () => {
    expect(getProgress().completedTopics).toHaveLength(0);

    visitTopic("python", "loops");
    expect(getProgress().lastTopic).toBe("python:loops");

    completeTopic("python", "loops");
    completeTopic("python", "loops"); // idempotent
    const p = getProgress();
    expect(p.completedTopics).toEqual(["python:loops"]);
    expect(p.lastTopic).toBe("python:loops");
  });

  it("records solved problems uniquely", () => {
    solveProblem("py-prog-fn");
    solveProblem("py-prog-fn");
    expect(getProgress().solvedProblems).toEqual(["py-prog-fn"]);
  });
});

describe("theme", () => {
  it("defaults to dark and persists the selection", () => {
    expect(getTheme()).toBe("dark");
    setTheme("light");
    expect(getTheme()).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    setTheme("dark");
    expect(getTheme()).toBe("dark");
  });

  it("survives corrupted storage values", () => {
    window.localStorage.setItem("codelabedu.progress.v1", "{not json");
    expect(getProgress()).toEqual({ completedTopics: [], solvedProblems: [] });
    window.localStorage.setItem("codelabedu.theme.v1", "blue");
    expect(getTheme()).toBe("dark");
  });
});
