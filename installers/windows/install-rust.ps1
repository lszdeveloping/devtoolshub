#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official rustup bootstrap for Windows x86_64
# https://rustup.rs/
Write-Host "Downloading rustup-init.exe..."

$installer = Join-Path $env:TEMP 'rustup-init.exe'
Invoke-WebRequest -Uri 'https://win.rustup.rs/x86_64' -OutFile $installer -UseBasicParsing

Write-Host "Launching rustup — choose toolchain options interactively..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
