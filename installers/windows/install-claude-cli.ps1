Write-Host "Installing Claude CLI..."
npm install -g @anthropic-ai/claude-code
if ($LASTEXITCODE -eq 0) { Write-Host "Claude CLI installed" } else { exit 1 }
