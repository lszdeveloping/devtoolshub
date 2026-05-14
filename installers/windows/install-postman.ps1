#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Postman download (latest win64)
# https://www.postman.com/downloads/
Write-Host "Downloading Postman installer..."

$installer = Join-Path $env:TEMP 'PostmanSetup.exe'
Invoke-WebRequest -Uri 'https://dl.pstmn.io/download/latest/win64' -OutFile $installer -UseBasicParsing

Write-Host "Launching Postman installer..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
