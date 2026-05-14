#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

# Source: official npm registry
# https://www.npmjs.com/package/yarn
Write-Host "Installing Yarn via npm..."

& npm install -g yarn
if ($LASTEXITCODE -ne 0) { throw 'npm install -g yarn failed; install Node.js first.' }
Write-Host "Yarn installed: $(& yarn --version)"
