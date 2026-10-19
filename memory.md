# DCF CodeLab — Project Memory

> Auto-generated 2026-09-23 — Lead Orchestrator (Muse Spark) — V1 + V2 + Ubuntu Real-Environment Validation
> Workspace: `C:\Users\nithu\OneDrive\Desktop\opencode project\codelab\`  (Windows dev)  →  `/opt/codelab/workspaces` on Ubuntu

---

## 1. Overview
CodeLab is a browser-based polyglot programming workspace for departmental testing:
- **Frontend:** React 18 + TypeScript + Vite 5 + Monaco Editor
- **Backend:** Spring Boot 3.2 + Java 17/21 (target 17), no DB, filesystem persistence
- **Execution:** Hardened Docker sandbox per run (python:3.11-slim, eclipse-temurin:17, gcc:13)
- **Languages:** python, java, c, cpp (c++ alias), language chosen via UI selector (not file extension)
- **No V3 yet:** no auth, no MySQL, no assignments, no grading, no Redis/RabbitMQ/K8s

Conceptual student layout:
```
/opt/codelab/workspaces/
  students/
    <student-id>/
      hello.py
      programs/
```

---

## 2. Architecture

```
Browser (Monaco + FileExplorer)
  │  X-Student-Id: dev-student (temporary dev identity, StudentWorkspaceResolver swappable for real auth)
  │  GET/POST/PUT/DELETE /api/files/**  → WorkspaceService → /opt/codelab/workspaces/students/<id>/
  │  POST /api/execute {language, sourceCode, stdin, executionId} → ExecutionService → DockerExecutor
  ↓
Spring Boot 8080 (CORS 5173)
  ├─ FileController  → PathValidator → StudentWorkspaceResolverImpl → WorkspaceService
  ├─ ExecutionController → ExecutionServiceImpl → ExecutionRegistry → DockerExecutor → ProcessRunner
  └─ GlobalExceptionHandler + WorkspaceExceptionHandler
         │
         ▼ docker run --rm --network none --cpu-period 100000 --cpu-quota 50000
            --memory 128m --memory-swap 128m --pids-limit 64 --read-only
            --tmpfs /tmp:exec,size=64m --cap-drop ALL --security-opt no-new-privileges
            --user 65534:65534 --name codelab-<id> -i -v <tempDir>:/workspace <image> sh -c "..."
         │
         └─ Temp exec dir codelab-* (755 dir / 644 file) → deleteRecursively in finally → docker kill/rm -f on timeout/cancel
Frontend dev: Vite 5173 proxy /api → 8080
Prod: nginx:alpine 80 → proxy /api/ → backend:8080 (frontend/Dockerfile + nginx.conf)
```

**Critical rule:** Persistent workspace is **never** mounted into Docker (`-v /opt/...:/workspace` forbidden). Flow is `read file → temp dir → docker → destroy`.

---

## 3. Contracts

### Execution (CONTRACT.md)
```
POST /api/execute {language, sourceCode, stdin, executionId?} → ExecutionResponse {executionId, status, language, stdout, stderr, exitCode, executionTimeMs, createdAt}
status: QUEUED | RUNNING | SUCCESS | FAILED | TIMEOUT | ERROR | CANCELLED
POST /api/execute/{id}/cancel → ExecutionResponse (idempotent)
GET  /api/execute/{id} → ExecutionResponse | 404
GET  /api/languages → [c,cpp,java,python]
GET  /api/health → {status:UP}
```
Validation: `@NotBlank @ValidLanguage @Size(max=102400)` sourceCode.

### File Workspace (V2_CONTRACT.md)
```
GET    /api/files                     → FileEntry[] {path,type,size,modified}
GET    /api/files?path=dir            → shallow dir
POST   /api/files {path,content}      → 201/409
GET    /api/files/{*path}             → {path,content}
PUT    /api/files/{*path} {content}   → 200
DELETE /api/files/{*path}             → 204
POST   /api/files/rename {from,to}    → 200
```
`X-Student-Id` header > `?studentId` > `dev-student` via `StudentWorkspaceResolver`. Max path 512, file 1MB.

---

## 4. Security Controls (Live Verified)

| Control | Value | Where | Live Evidence |
|---|---|---|---|
| Network | none | `--network none` | `socket Network unreachable`, `docker inspect NetworkMode none` |
| CPU | 0.5 cores | `--cpu-period 100000 --cpu-quota 50000` | `CpuPeriod 100000 Quota 50000` |
| Memory strict | 128m | `--memory 128m --memory-swap 128m` | `Memory 134217728 Swap 134217728`, 80M ok, 300M OOM 137 |
| PIDs | 64 | `--pids-limit 64` | fork bomb `63` |
| Filesystem | read-only + tmpfs | `--read-only --tmpfs /tmp:exec,size=64m` | `open('/etc/hosts') Permission denied` |
| Capabilities | drop ALL | `--cap-drop ALL` | `CapEff 0000000000000000`, device `mknod` `Operation not permitted` |
| No new privs | enabled | `--security-opt no-new-privileges` | `NoNewPrivs 1` |
| User | 65534:65534 | `--user 65534:65534` | `os.getuid 65534` |
| Socket | inaccessible | no mount | `os.path.exists('/var/run/docker.sock') False` |
| Timeout | 10s | `TIMEOUT_SECONDS 10` | `TIMEOUT 10014ms` |
| Output cap | 100KB | `OUTPUT_MAX_CHARS 102400` | `102428 [Output truncated]` |
| Temp dir perms | 755 / 644 | `Posix rwxr-xr-x / rw-r--r--` (was 777, fixed) | `wsl stat 755`, `Hello DCF SUCCESS` as 65534 |
| Workspace traversal | blocked | `PathValidator` (decode×3, .., absolute, \, symlink) | `../ /etc C:\ %2e %252e` all `400` |
| Student isolation | header-scoped | `students/<id>/` | `student1` cannot read `student2` `404` |

---

## 5. Workspace / PathValidator Logic

1. `decodeRepeatedly` URL-decode up to 3× to catch `%252e%252e`
2. Reject `\0` / `%00`
3. Reject absolute: `/`, `C:`, `C:\`, `\\`, `C:/`
4. Normalize `\`→`/`, reject `..` segment (strict, even if `normalize()` would stay inside)
5. `studentRoot.resolve(trim).normalize()` must `startsWith(studentRoot)`
6. If file exists, `toRealPath()` must stay inside (symlink escape blocked)
7. Both `from`/`to` in rename validated
8. `sanitizeStudentId` `^[A-Za-z0-9._-]+$` max 64, default `dev-student`

---

## 6. Frontend IDE (V2)

- **FileExplorer** `260px` left, `FILES` + `↻` refresh + `+ New File` input, `📄/📁` list active `#eff6ff`, `*` dirty, always-visible `✎`/`×` (28px), `title` size/modified
- **Editor state:** `activeFile, code, isDirty (code !== lastSavedRef), language, executionState`
- **Dirty workflow:** `window.confirm` Save/Cancel (save via `PUT`, Save-As via `POST` if no active file), switching files triggers `confirmDirtySwitch`
- **Header:** `DCF CodeLab` + `Python ▼` + `Save` `Run` `Save+Run` `Stop` (dark `#0f172a` 56px)
- **Save+Run:** if `isDirty && activeFile` → `PUT /api/files/{path}` → `POST /api/execute` with editor `code` (no mount). `Run` = execute without forced save.
- **Terminal:** `badge--SUCCESS/FAILED/TIMEOUT/ERROR/CANCELLED/RUNNING`, `border-left` `output-success/error/timeout/cancelled`, meta `exit/time/id/lang`
- **Responsive:** `.workspace flex`, `.panels grid 1fr 420px`, `@media 900px` stack column + explorer full-width, `@media 640px` selects flex
- **API:** `frontend/src/api/files.ts` (`X-Student-Id` from localStorage → `dev-student`) + `frontend/src/api.ts` (`executeCode` + `cancelExecution`)

---

## 7. Execution Lifecycle

```
POST /api/execute {executionId=client UUID or server generated}
  → registry.register(id, codelab-<8char>)
  → DockerExecutor.executeWithContainer(lang, code, stdin, containerName)
     → Files.createTempDirectory codelab- (755) + write main.py (644)
     → docker run hardened → ProcessRunner.waitFor(10s)
  → map: cancelled? CANCELLED : timedOut? TIMEOUT : dockerUnavailable? ERROR : exit 0? SUCCESS : FAILED
  → registry.complete(id, response)
  → finally deleteRecursively(tempDir)

POST /api/execute/{id}/cancel
  → registry.getRunning(id) → cancelled=true → docker kill + rm -f → wait 4s for complete → return CANCELLED (idempotent: if already completed return completed)
GET /api/execute/{id} → running RUNNING or completed
```

---

## 8. Subagents (Parallel)

| Agent | Files Owned | Done | Tests |
|---|---|---|---|
| **A Workspace Backend** | `workspace/**`, `config/WorkspaceConfig`, `application.properties` | Resolver/Validator/Service/Controller + 1MB limit + isolation | 57 (26 PathValidator, 17 Service, 14 Controller) → 122 total |
| **B Frontend Workspace** | `api/files.ts`, `components/FileExplorer.tsx`, `App.tsx` explorer | CRUD, dirty, Save+Run | — → 47 modules |
| **C Execution Integration** | `execution/ExecutionIntegrationTest` | Verified temp-only mount, 4 langs, stdin, concurrent, hardened | 10 → 132 total |
| **D UX** | `index.css`, `App.tsx` layout | Dark header, workspace flex, mobile stack, badges | — → 47 modules |

Lead fixed `777→755/644`, merged `App.tsx` (B+D), handled `mvn.zip` re-extract, kept `V2_CONTRACT.md` as source of truth.

---

## 9. Tests & Builds

```
mvn test -B
Tests run: 132, Failures: 0, Errors: 0, Skipped: 0  BUILD SUCCESS 31s
  PathValidator 26, Workspace 17, FileController 14, ExecutionIntegration 10,
  DockerExecutor 16, ExecutionService 8, Lifecycle 8, Security 9,
  Controller 10+4, Validation 10

npm run build
47 modules → index.html 0.50kB + css 8.67kB + js 173.77kB  built in ~2s PASS
```

Regression preserved: 65 → 132, no hardening weakened.

---

## 10. Ubuntu Real-Environment Validation (Phase 1-7)

**Env:** Docker `29.8.0 linux`, Java `21.0.8` (target 17), Node `24.16.0`, `wsl -d docker-desktop` Linux `uid 0`
**Deploy:** `WORKSPACE_ROOT=/opt/codelab/workspaces` → `C:\opt\codelab\workspaces\students\dev-student/hello.py` `18B` persists, Linux via `docker run -v C:\opt\...:/opt/... alpine ls -la` + `wsl mkdir -p /opt/codelab/workspaces && chmod 755 && stat -c '%a %u %g' → 755 0 0`
**Backend/Frontend:** `curl /api/health UP` `PASS`, `curl :5173 200` `PASS`
**File/Security:** see table below; **E2E** `hello.py print("Hello DCF")` → `SUCCESS Hello DCF`; **Concurrency** 5 students `SUCCESS` + isolation + `docker ps -a ''` no orphan

### Final PASS/FAIL Table (23 checks)
| # | Check | Status |
|---|---|---|
|1|Spring Boot starts|PASS|
|2|Docker accessible|PASS|
|3|Create workspace dirs|PASS|
|4|File CRUD|PASS|
|5|Linux perms 755/644|PASS|
|6|65534 can execute|PASS|
|7|Persistent not mounted|PASS|
|8|Temp dirs removed|PASS|
|9|Containers removed|PASS|
|10|Python/Java/C/C++|PASS|
|11|Compile error|PASS|
|12|Runtime error|PASS|
|13|Timeout|PASS|
|14|Cancellation|PASS|
|15|Network none|PASS|
|16|Memory strict|PASS|
|17|CPU|PASS|
|18|PID 64|PASS|
|19|non-root 65534|PASS|
|20|cap ALL dropped|PASS|
|21|no-new-privs|PASS|
|22|read-only|PASS|
|23|workspace outside container|PASS|
All **PASS**, 0 FAIL/NOT TESTED. Defect `777` fixed → retested `PASS`.

---

## 11. Current Workspace State (Production Path)

- **Root:** `C:\opt\codelab\workspaces` (maps to `/opt/codelab/workspaces` on Ubuntu, `WORKSPACE_ROOT=/opt/codelab/workspaces`)
- **Students:** `C:\opt\codelab\workspaces\students\dev-student/hello.py` (18B), `student1/secret.py`, `student2/secret.py`, `concurrent{0..4}/prog{i}.py` (cleaned after test)
- **Backend config:** `backend/src/main/resources/application.properties` `codelab.workspace.root=workspaces` + env `WORKSPACE_ROOT` override in `WorkspaceConfig.java:24`
- **Frontend config:** `VITE_API_URL` `/api` via `docker-compose.yml:35` + `nginx.conf` proxy `/api/ → backend:8080`, dev `VITE_API_URL=http://localhost:8080`

---

## 12. Known Issues & Next Milestone

- **Remaining:** `ExecutionRegistry.completed` unbounded (needs TTL), no real auth (dev header), no rate limiting/quotas
- **Next (not V3 yet):** DB-backed `StudentWorkspaceResolver` identity (keep filesystem for source) + per-student quota + execution history metadata + rate limiting. Keep `DockerExecutor` security unchanged.

---

## 13. How to Run (Windows dev / Ubuntu prod)

```bash
# dev
cd backend && WORKSPACE_ROOT=/opt/codelab/workspaces mvn spring-boot:run  # 8080
cd frontend && npm ci && npm run dev -- --host 0.0.0.0 --port 5173          # 5173

# prod docker-compose
docker compose up --build  # frontend 80→5173, backend 8080, workspace /opt/codelab/workspaces via volume

# Ubuntu manual
sudo mkdir -p /opt/codelab/workspaces/students && sudo chown -R codelab:codelab /opt/codelab && chmod 755 /opt/codelab/workspaces
WORKSPACE_ROOT=/opt/codelab/workspaces java -jar backend/target/*.jar
```

**Do NOT:** mount persistent workspace into Docker, add MySQL for source, add auth/grading yet, revert to 777, weaken sandbox.

---

## 14. Decision Log

- 2026-09-23: `chmod 777` → `755/644` least-privilege, verified `65534` can still read (world-readable suffices)
- 2026-09-23: Chose `X-Student-Id` header + `dev-student` default for V2 dev identity, interface swappable
- 2026-09-23: `PathValidator` strict `..` rejection even if `normalize()` would stay inside (safer than `startsWith` alone)
- 2026-09-23: `V2_CONTRACT.md` as parallel agents source of truth to avoid file conflicts
- 2026-09-23: Frontend keeps `Save` / `Run` / `Save+Run` separate (Run without forced save, Save+Run persists first)

---

*End of memory. V2 ready for controlled student testing. STOP before V3.*
