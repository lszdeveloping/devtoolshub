#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Go download metadata
# https://go.dev/dl/?mode=json
Write-Host "Downloading latest Go installer..."

$releases = Invoke-RestMethod 'https://go.dev/dl/?mode=json'
$latest = $releases | Where-Object { $_.stable -eq $true } | Select-Object -First 1
$file = $latest.files | Where-Object { $_.os -eq 'windows' -and $_.arch -eq 'amd64' -and $_.kind -eq 'installer' } | Select-Object -First 1
if (-not $file) { throw 'Go installer not found' }

$msi = Join-Path $env:TEMP $file.filename
Invoke-WebRequest -Uri "https://go.dev/dl/$($file.filename)" -OutFile $msi -UseBasicParsing

Write-Host "Launching Go installer - configure options in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
