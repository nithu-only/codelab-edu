/**
 * SQL execution using sql.js (SQLite compiled to WebAssembly), loaded on demand.
 * Each run gets a fresh, isolated in-memory database seeded with sample tables —
 * nothing persists between executions.
 */
import type { ExecRequest, ExecResult } from "../types";
import { normalizeOutput, trimOutput } from "./adapter";
// Vite emits the .wasm into dist/assets and gives us its final URL. The
// `?url` suffix keeps the binary out of the JS bundle; sql.js itself is
// only imported lazily from executeSql(), so none of this loads until SQL runs.
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

const SCHEMA_AND_DATA = `
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, major TEXT, gpa REAL);
INSERT INTO students VALUES
 (1,'Aisha Khan','Computer Science',3.8),
 (2,'Ben Carter','Mathematics',3.2),
 (3,'Chloe Nguyen','Computer Science',3.9),
 (4,'Diego Ramirez','Physics',3.4),
 (5,'Emma O''Brien','Computer Science',3.6),
 (6,'Farah Patel','Mathematics',3.1);

CREATE TABLE courses (id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, title TEXT, credits INTEGER);
INSERT INTO courses VALUES
 (1,'CS101','Intro to Programming',4),
 (2,'CS201','Data Structures',4),
 (3,'MA101','Calculus I',3),
 (4,'PH101','Mechanics',3);

CREATE TABLE enrollments (student_id INTEGER, course_id INTEGER, grade TEXT);
INSERT INTO enrollments VALUES
 (1,1,'A'),(1,2,'B'),(2,3,'A'),(3,1,'A'),(3,2,'A'),
 (4,4,'B'),(5,1,'C'),(5,2,'B'),(6,3,'B'),(2,1,'A');
`;

export const SQL_SAMPLE_TABLES = [
  "students(id, name, major, gpa)",
  "courses(id, code, title, credits)",
  "enrollments(student_id, course_id, grade)",
] as const;

interface SqlJsStatic {
  Database: new (data?: ArrayLike<number> | null) => SqlJsDatabase;
}
interface SqlJsDatabase {
  exec(sql: string): { columns: string[]; values: unknown[][] }[];
  run(sql: string): unknown;
  close(): void;
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

/** True when running under Node (vitest) instead of a browser. */
const IS_NODE =
  typeof process !== "undefined" &&
  !!(process as { versions?: { node?: string } }).versions?.node;

/**
 * Resolve the .wasm location for the current runtime:
 *  - browser: the URL emitted by Vite (`?url` above),
 *  - Node (tests): the real file inside node_modules, because sql.js reads
 *    the wasm from disk with fs in Node and a web path would fail.
 */
function resolveWasm(file: string): string {
  if (!file.endsWith(".wasm")) return file;
  if (IS_NODE && typeof process.cwd === "function") {
    return `${process.cwd()}/node_modules/sql.js/dist/sql-wasm.wasm`;
  }
  return wasmUrl;
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = import("sql.js").then((mod) => {
      // The package's default export is the async init factory; cast keeps our
      // minimal SqlJsStatic interface instead of pulling in the full typings.
      const init = mod.default as unknown as (cfg?: unknown) => Promise<SqlJsStatic>;
      return init({ locateFile: resolveWasm });
    });
  }
  return sqlJsPromise;
}

function formatTables(results: { columns: string[]; values: unknown[][] }[]): string {
  const parts: string[] = [];
  for (const r of results) {
    const rows = r.values.slice(0, 200);
    const widths = r.columns.map((c, i) =>
      Math.max(c.length, ...rows.map((row) => String(row[i] ?? "NULL").length)),
    );
    const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
    parts.push(sep);
    parts.push("| " + r.columns.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |");
    parts.push(sep);
    for (const row of rows) {
      parts.push("| " + row.map((v, i) => String(v ?? "NULL").padEnd(widths[i])).join(" | ") + " |");
    }
    parts.push(sep);
    parts.push(`${rows.length} row(s)`);
  }
  return parts.join("\n");
}

export async function executeSql(req: ExecRequest): Promise<ExecResult> {
  const start = performance.now();
  let db: SqlJsDatabase | null = null;
  try {
    const SQL = await loadSqlJs();
    db = new SQL.Database();
    db.run(SCHEMA_AND_DATA);
    const sql = req.stdin.trim()
      ? `-- optional student-provided setup\n${req.stdin}\n${req.code}`
      : req.code;
    const trimmed = sql.trim();
    if (!trimmed) {
      return { status: "RUNTIME_ERROR", stdout: "", stderr: "No SQL statement to execute." };
    }
    const statements = trimmed
      .split(";")
      .map((s) => s.trim())
      // Skip chunks that are empty or contain only comments. A leading comment
      // line does NOT disqualify a statement (e.g. "-- get names\nSELECT ...").
      .filter((s) => s.replace(/--[^\n]*/g, "").trim().length > 0);
    if (statements.length === 0) {
      return { status: "RUNTIME_ERROR", stdout: "", stderr: "No SQL statement to execute." };
    }
    const outputs: string[] = [];
    for (const stmt of statements) {
      const res = db.exec(stmt);
      const formatted = formatTables(res);
      if (formatted) outputs.push(formatted);
      else outputs.push(`OK — statement executed (${(db as unknown as { getRowsModified?: () => number }).getRowsModified?.() ?? 0} row(s) changed)`);
    }
    return {
      status: "SUCCESS",
      stdout: trimOutput(normalizeOutput(outputs.join("\n"))),
      stderr: "",
      timeMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      status: "RUNTIME_ERROR",
      stdout: "",
      stderr: trimOutput(normalizeOutput(err instanceof Error ? err.message : String(err))),
      timeMs: Math.round(performance.now() - start),
    };
  } finally {
    db?.close();
  }
}
