import { describe, expect, it } from "vitest";
import { executeSql } from "./sqlEngine";
import { getPath } from "../data/content";
import { outputsMatch } from "../lib/compare";

/**
 * Reference solutions for every SQL practice problem. These double as a
 * verification that each problem's expected sample output is actually
 * achievable against the seeded practice database.
 */
const SQL_SOLUTIONS: Record<string, string> = {
  "sql-prog-select": "SELECT id, name FROM students ORDER BY id;",
  "sql-prog-where":
    "SELECT name FROM students WHERE major = 'Mathematics' ORDER BY name;",
  "sql-prog-order": "SELECT name FROM students ORDER BY gpa DESC LIMIT 1;",
  "sql-prog-agg":
    "SELECT major, COUNT(*) AS n FROM students GROUP BY major ORDER BY major;",
  "sql-prog-join": `SELECT s.name
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE c.code = 'CS101'
ORDER BY s.name;`,
  "sql-prog-fn": "SELECT code, LENGTH(title) AS len FROM courses ORDER BY id;",
  "sql-prog-like": "SELECT name FROM students WHERE major LIKE 'C%' ORDER BY name;",
  "sql-prog-sub": `SELECT s.name
FROM enrollments e
JOIN students s ON s.id = e.student_id
GROUP BY s.id
HAVING COUNT(*) > 1
ORDER BY s.name;`,
  "sql-prog-ps": `SELECT major, ROUND(AVG(gpa), 2) AS avg_gpa
FROM students
GROUP BY major
ORDER BY major;`,
};

const sqlPath = getPath("sql");

describe("SQL lessons run against the seeded database", () => {
  for (const topic of sqlPath.topics) {
    for (const lesson of topic.lessons) {
      it(`${lesson.id}: example output matches the engine`, async () => {
        const res = await executeSql({
          language: "sql",
          code: lesson.exampleCode,
          stdin: lesson.exampleStdin,
        });
        expect(res.stderr).toBe("");
        expect(res.status).toBe("SUCCESS");
        expect(res.stdout).toBe(lesson.exampleOutput);
      });
    }
  }
});

describe("SQL problem sample expectations", () => {
  for (const topic of sqlPath.topics) {
    for (const problem of topic.problems) {
      it(`${problem.id}: reference solution passes every sample`, async () => {
        const solution = SQL_SOLUTIONS[problem.id];
        expect(solution, `missing reference solution for ${problem.id}`).toBeTruthy();
        for (const sample of problem.samples) {
          const res = await executeSql({
            language: "sql",
            code: solution!,
            stdin: sample.input,
          });
          expect(res.status).toBe("SUCCESS");
          expect(res.stderr).toBe("");
          expect(
            outputsMatch(res.stdout, sample.expectedOutput),
            `${problem.id} expected:\n${sample.expectedOutput}\nactual:\n${res.stdout}`,
          ).toBe(true);
        }
      });
    }
  }
});

describe("SQL engine behaviour", () => {
  it("executes a statement that has a leading comment line", async () => {
    const res = await executeSql({
      language: "sql",
      code: "-- get one name\nSELECT name FROM students LIMIT 1;",
      stdin: "",
    });
    expect(res.status).toBe("SUCCESS");
    expect(res.stdout).toContain("Aisha Khan");
  });

  it("rejects comment-only input with a clear error", async () => {
    const res = await executeSql({ language: "sql", code: "-- nothing here", stdin: "" });
    expect(res.status).toBe("RUNTIME_ERROR");
    expect(res.stderr).toContain("No SQL statement");
  });

  it("reports SQL syntax errors without crashing", async () => {
    const res = await executeSql({ language: "sql", code: "SELECT FROM WHERE;", stdin: "" });
    expect(res.status).toBe("RUNTIME_ERROR");
    expect(res.stderr.length).toBeGreaterThan(0);
  });

  it("starts from a fresh database on every run (no cross-run leakage)", async () => {
    await executeSql({
      language: "sql",
      code: "CREATE TABLE scratch (x INTEGER); INSERT INTO scratch VALUES (42);",
      stdin: "",
    });
    const res = await executeSql({ language: "sql", code: "SELECT * FROM scratch;", stdin: "" });
    expect(res.status).toBe("RUNTIME_ERROR"); // table only existed in the previous run
  });

  it("can run setup statements supplied via stdin before the main query", async () => {
    const res = await executeSql({
      language: "sql",
      code: "SELECT COUNT(*) AS n FROM extra;",
      stdin: "CREATE TABLE extra (id INTEGER); INSERT INTO extra VALUES (1), (2), (3);",
    });
    expect(res.status).toBe("SUCCESS");
    expect(res.stdout).toContain("| 3 |");
  });
});
