#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official RTK GitHub releases (zip-only)
# https://github.com/rtk-ai/rtk/releases
Write-Host "Downloading RTK..."

$installDir = Join-Path $env:LOCALAPPDATA 'rtk\bin'
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

$release  = Invoke-RestMethod 'https://api.github.com/repos/rtk-ai/rtk/releases/latest' -Headers @{ 'User-Agent' = 'devtoolshub' }
$asset    = $release.assets | Where-Object { $_.name -match 'x86_64-pc-windows-msvc\.zip$' } | Select-Object -First 1
$assetUrl = if ($asset) { $asset.browser_download_url } else { 'https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip' }

$zip = Join-Path $env:TEMP 'rtk.zip'
Invoke-WebRequest -Uri $assetUrl -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $installDir -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$installDir*") {
  [Environment]::SetEnvironmentVariable('Path', "$userPath;$installDir", 'User')
}
if (-not (Test-Path (Join-Path $installDir 'rtk.exe'))) { throw 'rtk.exe missing after extraction' }
Write-Host "RTK installed at $installDir. Open a new terminal and run 'rtk --version'."
