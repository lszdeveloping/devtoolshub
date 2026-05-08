Write-Host "Installing Yarn..."
npm install -g yarn
if ($LASTEXITCODE -eq 0) { Write-Host "Yarn installed: $(yarn --version)" } else { exit 1 }
