#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official EnterpriseDB distribution recommended by postgresql.org for Windows
# https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
Write-Host "Downloading PostgreSQL 16 installer..."

$installer = Join-Path $env:TEMP 'postgresql-16.6-windows-x64.exe'
Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64.exe' -OutFile $installer -UseBasicParsing

Write-Host "Launching PostgreSQL installer — set the superuser password, port and locale in the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
