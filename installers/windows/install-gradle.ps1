#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Gradle version service
# https://services.gradle.org/versions/current
Write-Host "Downloading Gradle (zip-only - extracted programmatically)..."

$current = Invoke-RestMethod 'https://services.gradle.org/versions/current'
if (-not $current.version -or -not $current.downloadUrl) { throw 'Gradle metadata missing' }

$zip        = Join-Path $env:TEMP "gradle-$($current.version)-bin.zip"
$installDir = Join-Path $env:ProgramFiles 'Gradle'

Invoke-WebRequest -Uri $current.downloadUrl -OutFile $zip -UseBasicParsing
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $installDir -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

$bin = Join-Path $installDir "gradle-$($current.version)\bin"
$sysPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
if ($sysPath -notlike "*$bin*") {
  [Environment]::SetEnvironmentVariable('Path', "$sysPath;$bin", 'Machine')
}
Write-Host "Gradle installed at $bin. Open a new terminal and run 'gradle --version'."
