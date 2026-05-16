#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official MySQL Community Server CDN
# https://dev.mysql.com/downloads/mysql/
Write-Host "Downloading MySQL 8.0 Community installer..."

$wampDir = 'C:\wamp64'
if (Test-Path (Join-Path $wampDir 'wampmanager.exe')) {
  $existing = Get-ChildItem (Join-Path $wampDir 'bin\mysql') -Directory -ErrorAction SilentlyContinue |
              Sort-Object Name -Descending | Select-Object -First 1
  if ($existing) {
    Write-Host "WampServer detected - MySQL already bundled: $($existing.Name). Skipping standalone install."
    exit 0
  }
}

$msi = Join-Path $env:TEMP 'mysql-8.0.40.msi'
Invoke-WebRequest -Uri 'https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.40-winx64.msi' -OutFile $msi -UseBasicParsing

Write-Host "Launching MySQL Installer - configure root password and ports in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
