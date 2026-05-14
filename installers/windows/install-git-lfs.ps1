#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official git-lfs GitHub releases (prefer Windows .exe installer)
# https://github.com/git-lfs/git-lfs/releases
Write-Host "Downloading Git LFS installer..."

$release = Invoke-RestMethod 'https://api.github.com/repos/git-lfs/git-lfs/releases/latest' -Headers @{ 'User-Agent' = 'devtoolshub' }
$asset = $release.assets | Where-Object { $_.name -match 'windows-amd64.*\.exe$' } | Select-Object -First 1
if (-not $asset) { throw 'Git LFS Windows installer not found' }

$installer = Join-Path $env:TEMP $asset.name
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $installer -UseBasicParsing

Write-Host "Launching Git LFS installer..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
