#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official GitHub CLI releases
# https://github.com/cli/cli/releases
Write-Host "Downloading GitHub CLI installer..."

$release = Invoke-RestMethod 'https://api.github.com/repos/cli/cli/releases/latest' -Headers @{ 'User-Agent' = 'devtoolshub' }
$asset = $release.assets | Where-Object { $_.name -match 'windows_amd64\.msi$' } | Select-Object -First 1
if (-not $asset) { throw 'GitHub CLI MSI not found' }

$msi = Join-Path $env:TEMP $asset.name
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msi -UseBasicParsing

Write-Host "Launching GitHub CLI installer - configure options in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue

Write-Host "Run 'gh auth login' in a new terminal to authenticate."
