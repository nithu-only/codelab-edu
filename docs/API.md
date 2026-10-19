# API Documentation — Execution Contract

Base URL: `http://localhost:8080` (or `http://backend:8080` inside compose network).  
Contract source: `CONTRACT.md`. Ownership: `backend/api` (Track A), `backend/execution` (Track B).

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/execute` | none | Execute code synchronously |
| GET | `/api/execute/{executionId}` | none | Fetch execution result (optional polling stub) |
| GET | `/api/languages` | none | List supported languages |
| GET | `/api/health` | none | Health check |

All responses are `application/json`. CORS: `http://localhost:5173` allowed (`backend/src/main/java/com/codelab/config/CorsConfig.java:13`).

---

## POST /api/execute

Execute source code in an isolated Docker container and return result inline.

### Request

Content-Type: `application/json`

```json
{
  "language": "python",
  "sourceCode": "print('hello')",
  "stdin": "optional input"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `language` | string | yes | One of `python`, `java`, `c`, `cpp` (case-insensitive, normalized to lower; `c++` alias for `cpp`). Validated by `@ValidLanguage` (`backend/src/main/java/com/codelab/validation/LanguageValidator.java:1`). |
| `sourceCode` | string | yes | Non-blank, max 102400 chars (100KB). `@NotBlank` + `@Size(max=102400)` (`backend/src/main/java/com/codelab/dto/ExecutionRequest.java:13`). |
| `stdin` | string | no | Default `""` if absent/null. Passed via `docker run -i` stdin pipe. |

### Response 200 — ExecutionResponse

```json
{
  "executionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "SUCCESS",
  "language": "python",
  "stdout": "hello\n",
  "stderr": "",
  "exitCode": 0,
  "executionTimeMs": 742,
  "createdAt": "2026-09-23T10:00:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `executionId` | string (uuid) | Unique per execution |
| `status` | enum | `QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`, `TIMEOUT`, `ERROR` |
| `language` | string | Normalized language |
| `stdout` | string | Captured stdout, truncated to 100KB (`DockerExecutor.OUTPUT_MAX_CHARS`) |
| `stderr` | string | Captured stderr (compile errors, runtime errors, timeout notice) |
| `exitCode` | int | Container exit code (0 = success, -1 for timeout/system error) |
| `executionTimeMs` | long | Wall time from temp dir creation to result |
| `createdAt` | ISO8601 | Creation timestamp |

Status mapping:

- `SUCCESS` — container exit 0
- `FAILED` — non-zero exit (compile or runtime error; `stderr` contains compiler/runtime message)
- `TIMEOUT` — exceeded 10s (`DockerExecutor.TIMEOUT_SECONDS`), container killed, `stderr` appended with `[Timeout after 10s - execution killed]`
- `ERROR` — system error (Docker unavailable, I/O error); check `stderr` and `docs/SETUP.md`

Output truncation: if `stdout`/`stderr` > 100KB, trimmed to 102400 chars + `\n[Output truncated to 100KB]` (`DockerExecutor.java:129`).

### Error responses

Validation failure (400):

```json
{
  "error": "Validation failed",
  "details": ["language must be one of: python, java, c, cpp", "sourceCode must not be blank"]
}
```

Handled by `backend/src/main/java/com/codelab/exception/GlobalExceptionHandler.java:1`.

System error (500) shape is same: `{error, details}`.

### cURL examples

```bash
# Python
curl -s http://localhost:8080/api/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"python","sourceCode":"print(\"hello\")"}' | jq

# With stdin
curl -s http://localhost:8080/api/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"python","sourceCode":"import sys; print(sys.stdin.read().strip())","stdin":"hi"}' | jq

# Java
curl -s http://localhost:8080/api/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"java","sourceCode":"public class Main { public static void main(String[] args){ System.out.println(\"hi\"); } }"}' | jq

# C
curl -s http://localhost:8080/api/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"c","sourceCode":"#include <stdio.h>\nint main(){printf(\"hi\\n\"); return 0;}"}' | jq

# Timeout (infinite loop)
curl -s http://localhost:8080/api/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"python","sourceCode":"while True: pass"}' | jq
# -> status TIMEOUT, stderr contains "[Timeout after 10s - execution killed]"

# Validation error
curl -s http://localhost:8080/api/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"ruby","sourceCode":"puts 1"}' | jq
# -> 400 {error, details}
```

### Frontend usage

```ts
// frontend/src/api.ts:5
import { executeCode } from "./api";
const res = await executeCode("python", "print('hi')", "");
// throws on non-2xx with parsed {error, details}
```

---

## GET /api/execute/{executionId}

Optional polling endpoint per contract. Current implementation is a **stub** (`backend/src/main/java/com/codelab/controller/ExecutionController.java:42`):

- Always returns `404` with `{error: "Not found", details: ["Execution not found: {id} (stub - no persistence)"]}`.
- Track B may add persistence later; until then, use synchronous `POST /api/execute` response.

```bash
curl -s http://localhost:8080/api/execute/any-id | jq
# {"error":"Not found","details":["Execution not found: any-id (stub - no persistence)"]}
```

---

## GET /api/languages

Returns supported language identifiers, sorted.

```bash
curl -s http://localhost:8080/api/languages | jq
# ["c","cpp","java","python"]
```

Response: `200` `string[]` — values from `Language.getSupportedValues()` (`backend/src/main/java/com/codelab/model/Language.java:54`), also mirrored in `LanguageConfig` (`backend/src/main/java/com/codelab/execution/LanguageConfig.java:9`).

Case-insensitive input accepted for `/api/execute`, but this endpoint returns lower-case canonical values.

---

## GET /api/health

Liveness probe.

```bash
curl -s http://localhost:8080/api/health | jq
# {"status":"UP"}
```

Response: `200` `{"status":"UP"}` (`backend/src/main/java/com/codelab/controller/ExecutionController.java:58`). Used by `docker-compose.yml` healthcheck.

---

## Language reference

See `README.md` Language Support and `backend/src/main/java/com/codelab/execution/LanguageConfig.java:9`:

| language | image | file | command |
|----------|-------|------|---------|
| `python` | `python:3.11-slim` | `main.py` | `python3 /workspace/main.py` |
| `java` | `eclipse-temurin:17` | `Main.java` | `javac /workspace/Main.java -d /tmp && java -cp /tmp Main` |
| `c` | `gcc:13` | `main.c` | `gcc /workspace/main.c -o /tmp/a.out && /tmp/a.out` |
| `cpp` | `gcc:13` | `main.cpp` | `g++ /workspace/main.cpp -o /tmp/a.out && /tmp/a.out` |

`cpp` also accepts `c++` alias (normalized in `Language.java:41` and `LanguageConfig.java:57`).

Limits: source 100KB, stdout/stderr 100KB each, wall time 10s. See `docs/SECURITY.md`.
