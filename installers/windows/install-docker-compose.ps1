Write-Host "Docker Compose is bundled with Docker Desktop on Windows."
Write-Host "Verifying..."
docker compose version
if ($LASTEXITCODE -eq 0) { Write-Host "Docker Compose ready" } else {
    Write-Error "Docker must be installed first"
    exit 1
}
