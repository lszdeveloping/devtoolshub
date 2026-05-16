#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: tporadowski Redis-for-Windows port (listed by Redis project for native Windows)
# https://github.com/tporadowski/redis/releases
Write-Host "Downloading Redis for Windows installer..."

$release = Invoke-RestMethod 'https://api.github.com/repos/tporadowski/redis/releases/latest' -Headers @{ 'User-Agent' = 'devtoolshub' }
$asset = $release.assets | Where-Object { $_.name -match '\.msi$' } | Select-Object -First 1
if (-not $asset) { throw 'Redis Windows MSI not found' }

$msi = Join-Path $env:TEMP $asset.name
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msi -UseBasicParsing

Write-Host "Launching Redis installer - configure options in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
