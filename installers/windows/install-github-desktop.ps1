#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official GitHub Desktop latest Windows installer redirect
# https://desktop.github.com/
Write-Host "Downloading GitHub Desktop..."

$installer = Join-Path $env:TEMP 'GitHubDesktopSetup.exe'
Invoke-WebRequest -Uri 'https://central.github.com/deployments/desktop/desktop/latest/win32' -OutFile $installer -UseBasicParsing

Write-Host "Launching GitHub Desktop installer..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
