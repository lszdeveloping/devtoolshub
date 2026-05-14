#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official MySQL Workbench Community CDN
# https://dev.mysql.com/downloads/workbench/
Write-Host "Downloading MySQL Workbench 8.0 installer..."

$msi = Join-Path $env:TEMP 'mysql-workbench-8.0.40.msi'
Invoke-WebRequest -Uri 'https://dev.mysql.com/get/Downloads/MySQLGUITools/mysql-workbench-community-8.0.40-winx64.msi' -OutFile $msi -UseBasicParsing

Write-Host "Launching MySQL Workbench installer..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
