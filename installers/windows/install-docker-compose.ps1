#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

# Docker Compose v2 ships bundled with Docker Desktop for Windows.
# https://docs.docker.com/compose/install/
Write-Host "Docker Compose ships bundled with Docker Desktop on Windows."

& docker compose version
if ($LASTEXITCODE -ne 0) {
  Write-Error 'Docker Desktop must be installed first.'
  exit 1
}
Write-Host "Docker Compose ready."
