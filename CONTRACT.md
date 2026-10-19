# Shared Execution Contract — Source of Truth

All tracks MUST conform to this contract. Do not invent incompatible variants.

## REST API

Base: `http://localhost:8080`

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/execute | Execute code synchronously |
| GET  | /api/execute/{executionId} | Fetch execution result (optional, for async/polling) |
| GET  | /api/languages | List supported languages |
| GET  | /api/health | Health check |

### ExecutionRequest
```json
{
  "language": "python | java | c | cpp",
  "sourceCode": "string (required, non-blank)",
  "stdin": "string (optional, default \"\")"
}
```

Validation:
- language must be one of allowed set (case-insensitive, normalized to lower)
- sourceCode required, max 100KB

### ExecutionResponse
```json
{
  "executionId": "uuid string",
  "status": "QUEUED | RUNNING | SUCCESS | FAILED | TIMEOUT | ERROR",
  "language": "python",
  "stdout": "string",
  "stderr": "string",
  "exitCode": 0,
  "executionTimeMs": 123,
  "createdAt": "ISO8601"
}
```

Status enum: `QUEUED, RUNNING, SUCCESS, FAILED, TIMEOUT, ERROR`
- SUCCESS = exitCode 0
- FAILED = non-zero exitCode (compile/runtime error)
- TIMEOUT = exceeded time limit
- ERROR = system error

### Error shape (validation / system)
```json
{ "error": "message", "details": ["..."] }
```

## Ownership
- `backend/api` → Track A
- `backend/execution` → Track B
- `frontend/` → Track C
- `docs/` + root docker-compose.yml + scripts → Track D

## Ports
- Backend: 8080
- Frontend: 5173 (Vite)
