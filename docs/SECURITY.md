# Security Model — CodeLab Execution Isolation

Execution runs untrusted user code. This document describes isolation guarantees, limits, and residual risks. Implementation: `backend/src/main/java/com/codelab/execution/DockerExecutor.java:1`, `LanguageConfig.java:1`, `DefaultProcessRunner.java:1`.

## Threat model

- **Untrusted code** — arbitrary Python/Java/C/C++ submitted via `POST /api/execute`.
- **Goals** — prevent host compromise, container escape, resource exhaustion, network exfiltration, persistence, and cross-execution data leak.
- **Trust boundary** — host Docker daemon + backend process are trusted; execution containers are untrusted.

## Isolation controls

| Control | Setting | Code / Config | Effect |
|---------|---------|---------------|--------|
| Network isolation | `--network none` | `DockerExecutor.java:66` | No egress/ingress; no DNS, no HTTP, no socket connect. Code cannot exfiltrate or fetch payloads. |
| CPU limit | `--cpus 0.5` | `DockerExecutor.java:67` | Caps to half core; prevents CPU hog. |
| Memory limit | `--memory 128m` | `DockerExecutor.java:68` | OOM kill at 128 MB; prevents memory bomb. |
| PID limit | `--pids-limit 64` | `DockerExecutor.java:69` | Prevents fork bomb. |
| Read-only root FS | `--read-only` | `DockerExecutor.java:70` | Container filesystem immutable; writes only to tmpfs mounts. |
| Tmpfs for build | `--tmpfs /tmp:exec,size=64m` | `DockerExecutor.java:71` | Compile artifacts in memory, `exec` allowed, capped 64 MB, ephemeral. |
| Workspace mount | `-v hostTemp:/workspace` | `DockerExecutor.java:74` | Source file only; host temp dir deleted after run (`deleteRecursively`). |
| No privileges | default (no `--privileged`) | — | No host device access, no capability escalation. |
| Auto-remove | `--rm` | `DockerExecutor.java:65` | Container removed on exit; no residue. |
| Timeout | `10s` | `DockerExecutor.TIMEOUT_SECONDS` (`DockerExecutor.java:26`), `DefaultProcessRunner` wait | Infinite loops killed; `killContainer` does `docker kill` + `docker rm -f` (`DockerExecutor.java:135`). |
| Output cap | `100KB` per stream | `OUTPUT_MAX_CHARS=102400` (`DockerExecutor.java:27`), `trim()` (`DockerExecutor.java:129`) | Prevents log flooding / memory blowup in backend. |
| Source cap | `100KB` | `@Size(max=102400)` on `ExecutionRequest.sourceCode` (`backend/src/main/java/com/codelab/dto/ExecutionRequest.java:14`) | Rejects oversized payloads at validation layer. |
| Input validation | allowlist + non-blank | `Language.java:13`, `LanguageValidator.java:1`, `ExecutionRequest.java:7` | Only `python/java/c/cpp` (plus `c++` alias); blank source rejected 400. |

## Execution lifecycle

1. Validate `ExecutionRequest` (language allowlist, source non-blank, size).
2. Normalize language to lower-case (`ExecutionRequest.getNormalizedLanguage()`).
3. Resolve `LanguageConfig` (image, filename, container command).
4. Create host temp dir (`Files.createTempDirectory("codelab-")`), write source file.
5. Build `docker run` args with limits above; invoke via `ProcessRunner` (`DockerExecutor.java:64`).
6. Stream `stdin` via `-i` pipe; capture `stdout`/`stderr` with 10s timeout.
7. On timeout: `killContainer` (`docker kill` + `docker rm -f`), append timeout notice to `stderr`.
8. Trim outputs to 100KB, compute `elapsed`, return `DockerExecutionResult`.
9. `finally`: `deleteRecursively(tempDir)` — always cleans host temp dir.

## Input validation

- **Language** — `@ValidLanguage` annotation; `Language.fromString()` and `LanguageConfig.fromNormalized()` throw on unsupported; controller returns 400 via `GlobalExceptionHandler`.
- **Source** — `@NotBlank` + `@Size(max=102400)`; empty/whitespace rejected.
- **Stdin** — optional, defaults to `""`; no size cap currently (recommend adding 100KB cap if abused).
- **No shell injection** — container command is fixed per language (`LanguageConfig.containerCommand`), not interpolated from user input. Source is written to file, never passed as shell arg.

## Resource limits detail

- **CPU 0.5** — enough for typical compile+run; throttled, not killed.
- **Memory 128m** — Java compile may near limit; `gcc` and `python` well within. OOM results in non-zero exit, surfaced as `FAILED`.
- **PIDs 64** — blocks naive fork bomb; sophisticated bomb still capped.
- **Timeout 10s** — wall time covering Docker startup + compile + run. Measured from temp dir creation (`System.currentTimeMillis()` in `DockerExecutor.java:53`). `ProcessRunner` uses `waitFor(TIMEOUT_SECONDS)`.
- **Read-only + tmpfs** — prevents writing to image FS; `/tmp` is exec-enabled for compiled binaries, but size-capped and cleared on container removal.

## Cleanup

- Container: `--rm` ensures removal on normal exit; timeout path explicitly `docker kill` + `docker rm -f` in case `--rm` races.
- Host temp dir: `deleteRecursively` walks reverse-sorted and deletes even on exception/timeout (`DockerExecutor.java:151`).
- No persistent volumes; no execution state kept (polling endpoint is stub).

## What is NOT isolated (known limitations)

- **Docker socket mount** — backend container mounts `/var/run/docker.sock`. A compromised backend could control host Docker. Mitigation: keep backend minimal, run as non-root if possible, consider `docker-socket-proxy` (read-only, filtered) for production.
- **No seccomp/AppArmor profile** — default Docker seccomp applies, but no custom profile. Add `--security-opt seccomp=...` for stricter syscall filtering if needed.
- **No user namespace remap** — containers run as default user (root inside container, but limited by no-privileged + read-only). Add `--user` or daemon `userns-remap` for stronger isolation.
- **Stdin size not capped** — large stdin could stress pipe; add validation if needed.
- **No rate limiting** — API has no per-IP throttling; add gateway or Spring filter for abuse prevention.
- **Images not pinned by digest** — `python:3.11-slim` etc. are tags, not digests; supply chain risk. Pin to digest in production.
- **No content scanning** — no static analysis of source for malicious patterns; rely on runtime isolation.

## Recommendations for production

- Put backend behind reverse proxy with rate limiting and request size limits.
- Pin image digests: `docker pull ... && docker inspect --format='{{.Id}}'`.
- Run `docker-socket-proxy` instead of direct socket mount, or use isolated Docker daemon (DinD sidecar) if host trust is critical.
- Add `SPRING_SECURITY` or API key if execution should not be public.
- Monitor `docker events` and backend logs for timeout/error spikes.
- Regularly update base images (`python:3.11-slim`, `eclipse-temurin:17`, `gcc:13`).

## Verification

```bash
# Network none
docker run --rm --network none python:3.11-slim python3 -c "import socket; socket.create_connection(('8.8.8.8',53))"
# -> should fail (network unreachable)

# Read-only
docker run --rm --read-only --tmpfs /tmp:exec,size=64m python:3.11-slim sh -c "touch /should-fail"
# -> Read-only file system

# Timeout
curl -s http://localhost:8080/api/execute -H "Content-Type: application/json" \
  -d '{"language":"python","sourceCode":"while True: pass"}' | jq .status
# -> TIMEOUT

# Output truncation — generate >100KB
curl -s http://localhost:8080/api/execute -H "Content-Type: application/json" \
  -d '{"language":"python","sourceCode":"print(\"a\"*200000)"}' | jq '.stdout | length'
# -> 102400 + notice
```
