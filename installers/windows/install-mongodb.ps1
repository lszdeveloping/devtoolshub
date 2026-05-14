#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official MongoDB CDN
# https://www.mongodb.com/try/download/community
Write-Host "Downloading MongoDB 7.0 Community installer..."

$msi = Join-Path $env:TEMP 'mongodb-7.0.16.msi'
Invoke-WebRequest -Uri 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.16-signed.msi' -OutFile $msi -UseBasicParsing

Write-Host "Launching MongoDB installer — configure service options in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
