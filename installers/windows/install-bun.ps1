#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Bun GitHub releases (zip-only)
# https://github.com/oven-sh/bun/releases
Write-Host "Downloading Bun..."

$release = Invoke-RestMethod 'https://api.github.com/repos/oven-sh/bun/releases/latest' -Headers @{ 'User-Agent' = 'devtoolshub' }
$asset = $release.assets | Where-Object { $_.name -eq 'bun-windows-x64.zip' } | Select-Object -First 1
if (-not $asset) { throw 'Bun Windows asset not found' }

$zip     = Join-Path $env:TEMP 'bun-windows-x64.zip'
$extract = Join-Path $env:TEMP 'bun-extract'
$bunDir  = Join-Path $env:USERPROFILE '.bun\bin'

if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
New-Item -ItemType Directory -Force -Path $bunDir | Out-Null

Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $extract -Force
$bunExe = Get-ChildItem -Path $extract -Recurse -Filter 'bun.exe' | Select-Object -First 1
if (-not $bunExe) { throw 'bun.exe missing inside archive' }
Copy-Item $bunExe.FullName (Join-Path $bunDir 'bun.exe') -Force
Remove-Item $zip, $extract -Recurse -Force -ErrorAction SilentlyContinue

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$bunDir*") {
  [Environment]::SetEnvironmentVariable('Path', "$userPath;$bunDir", 'User')
}
Write-Host "Bun installed at $bunDir. Open a new terminal and run 'bun --version'."
