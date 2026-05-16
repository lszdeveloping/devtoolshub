#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: Eclipse Adoptium Temurin API (latest LTS 21 Windows x64 JDK installer)
# https://api.adoptium.net/q/swagger-ui/
Write-Host "Downloading Eclipse Temurin JDK 21 installer..."

$release = Invoke-RestMethod 'https://api.adoptium.net/v3/assets/latest/21/hotspot?os=windows&architecture=x64&image_type=jdk' -Headers @{ 'User-Agent' = 'devtoolshub' }
if (-not $release[0].binary.installer) { throw 'Adoptium installer asset not found' }

$msi = Join-Path $env:TEMP 'jdk21-setup.msi'
Invoke-WebRequest -Uri $release[0].binary.installer.link -OutFile $msi -UseBasicParsing

Write-Host "Launching JDK 21 installer - configure options in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
