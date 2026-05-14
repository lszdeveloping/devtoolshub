#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Microsoft Download Center
# https://www.microsoft.com/en-us/download/details.aspx?id=29
Write-Host "Downloading Visual C++ 2008 SP1 Redistributable (x86)..."

$installer = Join-Path $env:TEMP 'vcredist_2008_x86.exe'
Invoke-WebRequest -Uri 'https://download.microsoft.com/download/5/D/8/5D8C65CB-C849-4025-8E95-C3966CAFD8AE/vcredist_x86.exe' -OutFile $installer -UseBasicParsing

Write-Host "Launching installer..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
