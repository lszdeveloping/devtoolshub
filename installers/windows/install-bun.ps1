Write-Host "Installing Bun..."
powershell -c "irm bun.sh/install.ps1 | iex"
if ($LASTEXITCODE -eq 0) {
    $env:Path += ";$env:USERPROFILE\.bun\bin"
    [System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
    Write-Host "Bun installed"
} else { exit 1 }
