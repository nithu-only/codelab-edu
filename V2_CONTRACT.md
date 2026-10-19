# V2 Contract — Persistent Workspace (Source of Truth for Parallel Agents)

## Identity (temporary/dev)
- Header `X-Student-Id` or query `?studentId=` optional, defaults to `dev-student` via `StudentWorkspaceResolver`.
- Design `StudentWorkspaceResolver` interface so real auth can replace it later. DO NOT hardcode a specific student name into paths.

## Filesystem layout (Ubuntu filesystem, no MySQL)
Base dir configurable: `codelab.workspace.root` property (default `./workspaces` relative to backend working dir, or env `WORKSPACE_ROOT=/tmp/codelab/workspaces` for tests).
Structure:
```
<workspaceRoot>/
  students/
    <student-id>/
      hello.py
      calculator.py
      programs/
```
All file operations are scoped to student's directory.

## File API (Agent A owns backend, Agent B consumes via frontend)

```
GET    /api/files                    -> list files for current student (returns [{path, type:"file"|"dir", size, modified}])
GET    /api/files/list?path=dir      -> optional subdir listing (or same as above)
POST   /api/files                    -> create file  Body: {path:"hello.py", content:"..."}  201 on success, 409 if exists
GET    /api/files/{*path}            -> read file  Returns {path, content}
PUT    /api/files/{*path}            -> save/update file Body: {content:"..."}
DELETE /api/files/{*path}            -> delete file (or dir if empty) 204
POST   /api/files/rename             -> rename Body: {from:"a.py", to:"b.py"}
```

- All paths are relative to student's root, never absolute.
- `path` is URL-decoded once by Spring, but validator must handle single/double encoded traversal (`%2e%2e%2f` -> `../`, `%252e%252e` double encode).
- Use Spring `/**` mapping or `@RequestParam path` to avoid path separator confusion.

## Path Security (Critical)
Reuse `PathValidator` / `WorkspaceService` utility:

1. Decode URL encoding repeatedly until stable (max 2-3 iterations) to catch double encoding.
2. Reject null bytes `\0`, backslash `\` as separator on Windows, but normalize both `/` and `\` to `/`.
3. Reject absolute paths (`/etc/passwd`, `C:\...`, `\\...`, paths starting with `/` after trim).
4. Reject empty, reject `.` alone, normalize `.` segments.
5. Resolve: `workspaceRoot/students/<id>/` + `requestedPath` -> `normalizedPath` via `Path.normalize()` and `toRealPath`-like checks without requiring file existence (use `resolve` + `normalize`).
6. Verify `normalizedPath.startsWith(workspaceRootForStudent)` strictly.
7. Resolve symlinks on existing files: if file exists, check `toRealPath()` still inside root; if symlink points outside, reject.
8. Enforce workspace boundary for rename: both `from` and `to` must pass same check, and `to` must not escape.

Test heavily: `../`, `..%2F`, `%252e%252e%2f`, `%2e%2e%5c`, `/etc/passwd`, `C:\Windows`, `a/../../b`, `a//b`, `a\..\b`, symlink attack (create symlink inside workspace pointing to `/etc`, then read via symlink path).

## File Types
- Allow `.py .java .c .cpp .txt .md .json` broadly; execution language is determined by UI `language` selector, not file extension. Do not block unknown extensions beyond security.

## Execution Integration (Agent C)
- Existing `POST /api/execute` remains unchanged (hardened Docker). Frontend Save+Run workflow: `PUT /api/files/{path}` (save) -> `POST /api/execute` with `sourceCode` from editor (not via mount).
- DO NOT mount persistent workspace into Docker (`-v /codelab/students/...:/workspace` forbidden).

## Ownership
- `backend/src/main/java/com/codelab/workspace/**` + `backend/src/main/java/com/codelab/config/WorkspaceConfig` + `FileController` -> Agent A
- `frontend/src/components/**` + `frontend/src/api/files.ts` + `frontend/src/App.tsx` (file explorer side) -> Agent B (but coordinate App.tsx merge)
- `backend/src/main/java/com/codelab/execution/**` already exists; Agent C only verifies integration + regression tests, must NOT weaken security flags
- `frontend/src/index.css` + layout -> Agent D (review/improve)
- `backend/src/test/**` each agent adds own tests but avoid same file conflicts: name tests `Workspace*Test`, `File*Test`, `ExecutionIntegrationTest`, etc.

## DB
No MySQL. Use filesystem only.

## Tests Required
Each agent adds tests in its area and runs `mvn test` + `npm run build`.
