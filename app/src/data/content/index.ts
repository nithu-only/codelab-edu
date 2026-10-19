import type { LanguageId, LearningPath, Problem, Topic } from "../../types";
import { cPath } from "./c";
import { cppPath } from "./cpp";
import { javaPath } from "./java";
import { javascriptPath } from "./javascript";
import { pythonPath } from "./python";
import { sqlPath } from "./sql";

export const LEARNING_PATHS: Record<LanguageId, LearningPath> = {
  c: cPath,
  cpp: cppPath,
  java: javaPath,
  python: pythonPath,
  javascript: javascriptPath,
  sql: sqlPath,
};

export const PATH_ORDER: LanguageId[] = ["python", "javascript", "sql", "c", "cpp", "java"];

export function getPath(language: LanguageId): LearningPath {
  return LEARNING_PATHS[language];
}

export function findTopic(language: LanguageId, topicId: string): Topic | undefined {
  return LEARNING_PATHS[language]?.topics.find((t) => t.id === topicId);
}

export interface ProblemLocation {
  path: LearningPath;
  topic: Topic;
  problem: Problem;
}

let problemIndex: Map<string, ProblemLocation> | null = null;

function buildIndex(): Map<string, ProblemLocation> {
  const index = new Map<string, ProblemLocation>();
  for (const path of Object.values(LEARNING_PATHS)) {
    for (const topic of path.topics) {
      for (const problem of topic.problems) {
        index.set(problem.id, { path, topic, problem });
      }
    }
  }
  return index;
}

export function findProblem(problemId: string): ProblemLocation | undefined {
  if (!problemIndex) problemIndex = buildIndex();
  return problemIndex.get(problemId);
}

export function allProblems(): ProblemLocation[] {
  if (!problemIndex) problemIndex = buildIndex();
  return [...problemIndex.values()];
}

export function totalTopics(): number {
  return Object.values(LEARNING_PATHS).reduce((sum, p) => sum + p.topics.length, 0);
}

export function totalProblems(): number {
  return allProblems().length;
}
