import type { Lesson, Problem } from "../../../types";

type Extra = Partial<
  Pick<Lesson, "exampleStdin" | "explanation" | "tips" | "mistakes" | "objectives">
>;

export function L(
  id: string,
  title: string,
  concept: string,
  syntax: string,
  exampleCode: string,
  exampleOutput: string,
  extra: Extra = {},
): Lesson {
  return { id, title, concept, syntax, exampleCode, exampleStdin: "", exampleOutput, ...extra };
}

export function P(
  id: string,
  title: string,
  difficulty: Problem["difficulty"],
  prompt: string,
  starterCode: string,
  expectedOutput: string,
  hints: string[],
  explanation: string,
  input = "",
): Problem {
  return {
    id,
    title,
    difficulty,
    prompt,
    starterCode,
    samples: [{ input, expectedOutput }],
    hints,
    explanation,
  };
}

export const mainOpen = `#include <stdio.h>

int main() {`;

export const mainClose = `    return 0;
}`;
