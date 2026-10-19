import { describe, expect, it } from "vitest";
import { LEARNING_PATHS, PATH_ORDER, allProblems, findProblem, totalProblems, totalTopics } from "./content";
import { LANGUAGE_LABELS, type LanguageId } from "../types";

const LANGS = Object.keys(LANGUAGE_LABELS) as LanguageId[];

describe("learning content structure", () => {
  it("covers all six languages", () => {
    expect(Object.keys(LEARNING_PATHS).sort()).toEqual([...LANGS].sort());
    expect(PATH_ORDER.length).toBe(6);
  });

  it("has 9 topics and at least one lesson + one problem per topic", () => {
    for (const lang of LANGS) {
      const path = LEARNING_PATHS[lang];
      expect(path.topics.length, `${lang} topics`).toBeGreaterThanOrEqual(8);
      expect(path.blurb.length).toBeGreaterThan(20);
      for (const topic of path.topics) {
        expect(topic.lessons.length, `${lang}/${topic.id} lessons`).toBeGreaterThanOrEqual(1);
        expect(topic.problems.length, `${lang}/${topic.id} problems`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("uses unique topic keys and problem ids", () => {
    const topicKeys = new Set<string>();
    const problemIds = new Set<string>();
    const lessonIds = new Set<string>();
    for (const path of Object.values(LEARNING_PATHS)) {
      for (const topic of path.topics) {
        const key = `${path.language}:${topic.id}`;
        expect(topicKeys.has(key), `duplicate topic ${key}`).toBe(false);
        topicKeys.add(key);
        for (const lesson of topic.lessons) {
          expect(lessonIds.has(lesson.id), `duplicate lesson ${lesson.id}`).toBe(false);
          lessonIds.add(lesson.id);
          expect(lesson.exampleCode.trim().length).toBeGreaterThan(0);
          expect(lesson.exampleOutput.trim().length).toBeGreaterThan(0);
        }
        for (const problem of topic.problems) {
          expect(problemIds.has(problem.id), `duplicate problem ${problem.id}`).toBe(false);
          problemIds.add(problem.id);
          expect(problem.starterCode.trim().length).toBeGreaterThan(0);
          expect(problem.samples.length).toBeGreaterThanOrEqual(1);
          expect(problem.hints.length).toBeGreaterThanOrEqual(1);
          expect(problem.explanation.trim().length).toBeGreaterThan(0);
        }
      }
    }
    expect(totalTopics()).toBe(topicKeys.size);
    expect(totalProblems()).toBe(problemIds.size);
  });

  it("finds problems by id with their location", () => {
    const first = allProblems()[0];
    const found = findProblem(first.problem.id);
    expect(found?.problem.id).toBe(first.problem.id);
    expect(found?.topic.id).toBe(first.topic.id);
    expect(findProblem("does-not-exist")).toBeUndefined();
  });

  it("keeps sample expectations non-empty", () => {
    for (const { problem } of allProblems()) {
      for (const s of problem.samples) {
        expect(s.expectedOutput.trim().length, `${problem.id} sample`).toBeGreaterThan(0);
      }
    }
  });
});
