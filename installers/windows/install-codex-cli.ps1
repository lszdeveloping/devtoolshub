Write-Host "Installing Codex CLI..."
npm install -g @openai/codex
if ($LASTEXITCODE -eq 0) { Write-Host "Codex CLI installed" } else { exit 1 }
