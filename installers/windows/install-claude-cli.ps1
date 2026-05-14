#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

# Source: official Anthropic npm package
# https://www.npmjs.com/package/@anthropic-ai/claude-code
Write-Host "Installing Claude Code CLI via npm..."

& npm install -g @anthropic-ai/claude-code
if ($LASTEXITCODE -ne 0) { throw 'npm install failed; ensure Node.js is installed.' }
Write-Host "Claude CLI installed: $(& claude --version)"
