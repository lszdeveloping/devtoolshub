#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Node.js distribution index
# https://nodejs.org/dist/
Write-Host "Downloading Node.js LTS installer..."

$index = Invoke-RestMethod 'https://nodejs.org/dist/index.json'
$lts = $index | Where-Object { $_.lts -ne $false } | Select-Object -First 1
if (-not $lts) { throw 'Could not resolve Node.js LTS' }
$version = $lts.version

$msi = Join-Path $env:TEMP "node-$version.msi"
Invoke-WebRequest -Uri "https://nodejs.org/dist/$version/node-$version-x64.msi" -OutFile $msi -UseBasicParsing

Write-Host "Launching Node.js installer - configure options in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
