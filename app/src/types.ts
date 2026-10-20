export type LanguageId = "c" | "cpp" | "java" | "python" | "javascript" | "sql";

export type ExecStatus =
  | "SUCCESS"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "TIMEOUT"
  | "ERROR"
  | "NOT_CONFIGURED";

export interface ExecRequest {
  language: LanguageId;
  code: string;
  stdin: string;
}

export interface ExecResult {
  status: ExecStatus;
  stdout: string;
  stderr: string;
  timeMs?: number;
  /**
   * Set when an in-browser engine failed to load (CDN/network) rather than the
   * student's code failing — lets the dispatcher fall back to a remote provider.
   */
  engineUnavailable?: boolean;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  starterCode: string;
  /** Visible sample tests shown to the student. */
  samples: TestCase[];
  hints: string[];
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  syntax: string;
  exampleCode: string;
  exampleStdin: string;
  exampleOutput: string;
}

export interface Topic {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: Lesson[];
  problems: Problem[];
}

export interface LearningPath {
  language: LanguageId;
  label: string;
  blurb: string;
  topics: Topic[];
}

export interface SavedProgram {
  id: string;
  name: string;
  language: LanguageId;
  code: string;
  stdin: string;
  updatedAt: number;
}

export interface ProgressState {
  /** Topic keys "lang:topicId" completed (lesson viewed / mark done). */
  completedTopics: string[];
  /** Problem ids solved. */
  solvedProblems: string[];
  /** Last lesson visited, e.g. "python:loops" for Continue Learning. */
  lastTopic?: string;
}

export const LANGUAGE_LABELS: Record<LanguageId, string> = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  sql: "SQL",
};
