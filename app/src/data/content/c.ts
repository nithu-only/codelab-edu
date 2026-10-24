import type { LearningPath } from "../../types";
import { sections1 } from "./c/sections1";
import { sections2 } from "./c/sections2";
import { sections3 } from "./c/sections3";
import { sections4 } from "./c/sections4";

export const cPath: LearningPath = {
  language: "c",
  label: "C",
  blurb:
    "A complete, interactive C tutorial: start with your first program, master data types and format specifiers, then move through loops, functions, arrays, strings, pointers, structures, dynamic memory and the preprocessor. Every example runs in your browser.",
  topics: [...sections1, ...sections2, ...sections3, ...sections4],
};
