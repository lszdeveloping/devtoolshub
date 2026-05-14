#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

# Source: official OpenAI Codex CLI npm package
# https://www.npmjs.com/package/@openai/codex
Write-Host "Installing OpenAI Codex CLI via npm..."

& npm install -g @openai/codex
if ($LASTEXITCODE -ne 0) { throw 'npm install failed; ensure Node.js is installed.' }
Write-Host "Codex CLI installed: $(& codex --version)"
