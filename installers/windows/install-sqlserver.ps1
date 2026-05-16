#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Microsoft download for SQL Server 2022 Express SSEI bootstrapper
# https://www.microsoft.com/en-us/sql-server/sql-server-downloads
Write-Host "Downloading SQL Server Express 2022 bootstrapper..."

$installer = Join-Path $env:TEMP 'SQL2022-SSEI-Expr.exe'
Invoke-WebRequest -Uri 'https://download.microsoft.com/download/5/1/4/5145fe04-4d30-4b85-b0d1-39533663a2f1/SQL2022-SSEI-Expr.exe' -OutFile $installer -UseBasicParsing

Write-Host "Launching SQL Server Express installer - choose Basic/Custom/Download Media in the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
