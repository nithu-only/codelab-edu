# SETUP — Ubuntu / Docker Configuration

Detailed host setup for CodeLab. Covers Ubuntu 22.04/24.04, Docker Engine, permissions, image pulls, daemon/firewall, and troubleshooting. For quick start, see `README.md`.

## Prerequisites

- Ubuntu 22.04 LTS or 24.04 LTS (or WSL2 Ubuntu on Windows)
- `sudo` access
- Internet access to Docker Hub
- Ports `8080` (backend) and `5173` (frontend) free

Check existing installs:

```bash
java -version        # expect 17
mvn -version
node -v && npm -v    # node >= 18
docker --version
docker compose version
```

## 1. Java 17

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version
# Alternative: SDKMAN
# curl -s https://get.sdkman.io | bash
# sdk install java 17.0.11-tem
# sdk install maven
```

Maven:

```bash
sudo apt install -y maven
mvn -version
```

## 2. Node 18

```bash
# NodeSource repo (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

# Or via NVM:
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# nvm install 18 && nvm use 18
```

## 3. Docker Engine (Ubuntu)

Follow [Docker official docs](https://docs.docker.com/engine/install/ubuntu/). Summary:

```bash
# Remove old packages
sudo apt remove docker docker-engine docker.io containerd runc 2>/dev/null; true

# Prerequisites
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# Add Docker GPG key + repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify
docker --version
docker compose version
sudo docker run --rm hello-world
```

### Docker without sudo (required for backend `docker run` via socket)

```bash
sudo groupadd docker 2>/dev/null; true
sudo usermod -aG docker $USER
newgrp docker        # apply in current shell, or log out/in
docker info          # must succeed without sudo
docker ps
```

If `docker info` still fails, check socket permissions:

```bash
ls -l /var/run/docker.sock   # expect srw-rw---- root docker
sudo chmod 660 /var/run/docker.sock  # if needed (systemd resets on restart)
```

**Compose note:** backend container mounts `/var/run/docker.sock:/var/run/docker.sock` (`docker-compose.yml:10`). The host daemon must be running; no DinD sidecar needed.

### Docker daemon

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
sudo journalctl -u docker -n 100 --no-pager

# Daemon config (optional tuning) — /etc/docker/daemon.json
# {
#   "log-driver": "json-file",
#   "log-opts": { "max-size": "10m", "max-file": "3" }
# }
# sudo systemctl restart docker
```

Resource sizing: each execution container is capped at 0.5 CPU / 128 MB / 64 PIDs (`backend/src/main/java/com/codelab/execution/DockerExecutor.java:64`). Host should have at least 2 GB RAM free for concurrent runs + backend (512 MB).

## 4. Pull language images

Pre-pull to avoid cold-start latency on first `/api/execute`:

```bash
docker pull python:3.11-slim
docker pull eclipse-temurin:17
docker pull gcc:13

docker images | grep -E "python|temurin|gcc"
```

These match `backend/src/main/java/com/codelab/execution/LanguageConfig.java:11`.

To save disk, images are shared between host and sibling containers (same daemon via socket).

Update images periodically:

```bash
docker pull python:3.11-slim && docker pull eclipse-temurin:17 && docker pull gcc:13
```

## 5. Firewall

If `ufw` is enabled, allow dev ports:

```bash
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
sudo ufw status
```

For production behind reverse proxy, only expose 5173 (nginx) and keep 8080 internal (remove `ports: ["8080:8080"]` or bind to `127.0.0.1:8080:8080`).

No execution container needs network — they run `--network none` (`DockerExecutor.java:66`).

## 6. Running the stack

### Dev mode (no compose)

```bash
# Backend
cd backend && mvn spring-boot:run
# Frontend (second terminal)
cd frontend && npm install && npm run dev
```

### Compose mode

```bash
cp .env.example .env   # edit if needed
docker compose up --build
docker compose logs -f backend
docker compose down
```

Helper scripts:

```bash
bash scripts/dev.sh          # Linux/macOS — starts backend + frontend in background
powershell -File scripts/dev.ps1  # Windows
```

## 7. Env config

Root `.env` is loaded by `docker-compose.yml` (`env_file: .env`):

| Var | Default | Description |
|-----|---------|-------------|
| `SERVER_PORT` | `8080` | Backend port |
| `SPRING_APPLICATION_NAME` | `codelab-backend` | App name |
| `VITE_API_URL` | `/api` (compose) / `http://localhost:8080` (dev) | Frontend API base |

Never commit `.env`. Edit `backend/src/main/resources/application.properties` only via env overrides. See `.env.example`.

For Vite dev, `VITE_API_URL` is read at runtime via `import.meta.env`; for Docker build it is a build arg (`frontend/Dockerfile:8`).

## Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| `Docker not available: Cannot run program "docker"` | Docker not installed or not on PATH. Install Docker CLI; in compose, ensure `docker.io` installed in backend image (`backend/Dockerfile:10`) and socket mounted. |
| `permission denied while trying to connect to Docker daemon` | User not in `docker` group. `sudo usermod -aG docker $USER` + re-login. Check `ls -l /var/run/docker.sock`. |
| `docker: command not found` inside backend | Backend image missing docker CLI. Rebuild: `docker compose build --no-cache backend`. |
| `port is already allocated` | Another process on 8080/5173. `sudo lsof -i :8080` or `sudo ss -tulpn | grep 8080`. Change port in `docker-compose.yml` or `.env`. |
| First execution hangs 30-60s | Image pull. Pre-pull images (section 4) or check `docker pull` network. |
| `Output truncated to 100KB` | Expected — `DockerExecutor.OUTPUT_MAX_CHARS=102400`. Large outputs are capped. |
| `Timeout after 10s` | Expected for infinite loops — `DockerExecutor.TIMEOUT_SECONDS=10` kills container. `stderr` will contain timeout notice. |
| `sourceCode must not exceed 100KB` (400) | Validation — `ExecutionRequest.java:14`. Trim source. |
| CORS error in browser | `CorsConfig.java:13` only allows `http://localhost:5173`. If serving frontend elsewhere, update allowedOrigins or set `VITE_API_URL` correctly. |
| `docker compose up` fails on `healthcheck` | Backend not ready in 40s. Check `docker compose logs backend`; increase `start_period` or run `curl http://localhost:8080/api/health` manually. |
| WSL2: `docker: Cannot connect` | Ensure Docker Desktop is running and WSL integration enabled (Settings > Resources > WSL Integration). Or install docker inside WSL2 per section 3. |
| Disk full after many runs | Execution containers are `--rm` and temp dirs deleted, but pulled images remain. `docker system prune -a` to clean. Execution itself leaves no residue. |

### Useful commands

```bash
docker compose ps
docker compose logs -f --tail 100 backend
docker compose exec backend sh -c "docker ps -a; docker images"
curl -s http://localhost:8080/api/health | jq
curl -s http://localhost:8080/api/languages | jq
docker stats --no-stream
df -h && docker system df
```

## Security hardening (optional)

- Run backend as non-root inside container (add `USER` in Dockerfile) — currently runs as root to access docker socket; restrict socket via `docker-socket-proxy` if needed.
- Bind backend to localhost only: `ports: ["127.0.0.1:8080:8080"]` in compose.
- Enable AppArmor/SELinux on host; execution containers already use `--read-only` and `--pids-limit`.
- See `docs/SECURITY.md` for full threat model.
