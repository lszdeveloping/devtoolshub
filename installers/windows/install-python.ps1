#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: python.org official FTP directory
# https://www.python.org/ftp/python/
Write-Host "Downloading latest Python 3.12 installer..."

$series  = '3.12'
$listing = (Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/' -UseBasicParsing).Content
$matches = [regex]::Matches($listing, "href=`"($([regex]::Escape($series))\.\d+)/`"")
$version = $matches | ForEach-Object { $_.Groups[1].Value } |
           Sort-Object { [Version]$_ } -Descending | Select-Object -First 1
if (-not $version) { $version = '3.12.10' }

$installer = Join-Path $env:TEMP "python-$version-amd64.exe"
Invoke-WebRequest -Uri "https://www.python.org/ftp/python/$version/python-$version-amd64.exe" -OutFile $installer -UseBasicParsing

Write-Host "Launching Python installer - configure options in the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue
