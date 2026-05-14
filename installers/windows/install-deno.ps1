#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Deno GitHub releases (zip-only — no GUI installer exists)
# https://github.com/denoland/deno/releases
Write-Host "Downloading Deno..."

$release = Invoke-RestMethod 'https://api.github.com/repos/denoland/deno/releases/latest' -Headers @{ 'User-Agent' = 'devtoolshub' }
$asset = $release.assets | Where-Object { $_.name -eq 'deno-x86_64-pc-windows-msvc.zip' } | Select-Object -First 1
if (-not $asset) { throw 'Deno Windows asset not found' }

$zip     = Join-Path $env:TEMP 'deno.zip'
$denoDir = Join-Path $env:USERPROFILE '.deno\bin'
New-Item -ItemType Directory -Force -Path $denoDir | Out-Null

Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $denoDir -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$denoDir*") {
  [Environment]::SetEnvironmentVariable('Path', "$denoDir;$userPath", 'User')
}
Write-Host "Deno installed at $denoDir. Open a new terminal and run 'deno --version'."
