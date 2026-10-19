# Helper — run backend + frontend in dev mode on Windows (PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Write-Host "== CodeLab dev ==" -ForegroundColor Cyan
Write-Host "Root: $Root"

function Test-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "$name not found on PATH"
    exit 1
  }
}
Test-Cmd java
Test-Cmd mvn
Test-Cmd node
Test-Cmd npm

# Start backend
Write-Host "-- Starting backend (8080) --" -ForegroundColor Yellow
$BackendLog = Join-Path $env:TEMP "codelab-backend.log"
$BackendProc = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory (Join-Path $Root "backend") -PassThru -WindowStyle Hidden -RedirectStandardOutput $BackendLog -RedirectStandardError $BackendLog
Write-Host "Backend PID $($BackendProc.Id) (log: $BackendLog)"

Write-Host "Waiting for backend health..."
$up = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 2
    if ($r.status -eq "UP") { $up = $true; break }
  } catch {}
  if ($BackendProc.HasExited) {
    Write-Error "Backend exited early — see $BackendLog"
    Get-Content $BackendLog -Tail 50 | Write-Host
    exit 1
  }
}
if ($up) { Write-Host "Backend UP" -ForegroundColor Green } else { Write-Warning "Backend not UP after 60s — check $BackendLog" }

# Start frontend
Write-Host "-- Starting frontend (5173) --" -ForegroundColor Yellow
$FrontendDir = Join-Path $Root "frontend"
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
  Write-Host "Installing frontend deps..."
  Push-Location $FrontendDir; npm install; Pop-Location
}
$EnvFile = Join-Path $FrontendDir ".env"
if (-not (Test-Path $EnvFile)) {
  Set-Content -Path $EnvFile -Value "VITE_API_URL=http://localhost:8080"
  Write-Host "Created frontend/.env"
}
$FrontendProc = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $FrontendDir -PassThru
Write-Host "Frontend PID $($FrontendProc.Id)"

Write-Host ""
Write-Host "Ready:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  Backend:  http://localhost:8080/api/health"
Write-Host "  Backend log: $BackendLog"
Write-Host "Press Ctrl+C to stop. Then run: Stop-Process -Id $($BackendProc.Id), $($FrontendProc.Id) -Force"
# Keep script alive until user stops
try { Wait-Process -Id $BackendProc.Id, $FrontendProc.Id } catch {}
