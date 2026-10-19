#!/usr/bin/env bash
# Helper — run backend + frontend in dev mode (no Docker)
# Usage: bash scripts/dev.sh  (or: chmod +x scripts/dev.sh && ./scripts/dev.sh)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo "Stopping..."
  [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
  [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "== CodeLab dev =="
echo "Root: $ROOT"

# Checks
command -v java >/dev/null 2>&1 || { echo "java not found (need 17)"; exit 1; }
command -v mvn  >/dev/null 2>&1 || { echo "mvn not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "node not found (need 18)"; exit 1; }

echo "-- Starting backend (8080) --"
cd "$ROOT/backend"
# Use spring-boot:run in background
mvn spring-boot:run > /tmp/codelab-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID $BACKEND_PID (log: /tmp/codelab-backend.log)"

echo "Waiting for backend health..."
for i in $(seq 1 60); do
  if curl -fs http://localhost:8080/api/health 2>/dev/null | grep -q UP; then
    echo "Backend UP"
    break
  fi
  sleep 1
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start — see /tmp/codelab-backend.log"
    cat /tmp/codelab-backend.log | tail -n 50
    exit 1
  fi
done

echo "-- Starting frontend (5173) --"
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  echo "Installing frontend deps..."
  npm install
fi
# Ensure VITE_API_URL for dev
if [ ! -f .env ]; then
  echo "VITE_API_URL=http://localhost:8080" > .env
  echo "Created frontend/.env"
fi
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID $FRONTEND_PID"

echo ""
echo "Ready:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080/api/health"
echo "Logs: tail -f /tmp/codelab-backend.log"
echo "Press Ctrl+C to stop both."
wait
