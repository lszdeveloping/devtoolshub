#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Microsoft VS Code stable redirect (System x64)
# https://code.visualstudio.com/download
Write-Host "Downloading VS Code installer..."

$installer = Join-Path $env:TEMP 'VSCodeSetup-x64.exe'
Invoke-WebRequest -Uri 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64' -OutFile $installer -UseBasicParsing

Write-Host "Launching VS Code installer — configure options in the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
