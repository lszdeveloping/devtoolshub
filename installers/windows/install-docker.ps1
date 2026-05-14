#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Docker Desktop redirect (latest stable Windows amd64)
# https://docs.docker.com/desktop/install/windows-install/
Write-Host "Downloading Docker Desktop installer..."

$installer = Join-Path $env:TEMP 'DockerDesktopInstaller.exe'
Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe' -OutFile $installer -UseBasicParsing

Write-Host "Launching Docker Desktop installer — configure options in the wizard..."
Start-Process -FilePath $installer -ArgumentList 'install' -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue

Write-Host "Docker Desktop installed. A reboot is required to complete setup."
