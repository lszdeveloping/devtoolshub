#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Sources:
# - WampServer addon: https://wampserver.aviatechno.net/files/php/
# - Standalone:       https://windows.php.net/downloads/releases/ (official)
Write-Host "Installing PHP..."

$wampDir = 'C:\wamp64'

if (Test-Path (Join-Path $wampDir 'wampmanager.exe')) {
  Write-Host "WampServer detected - installing PHP addon..."
  $url = $null
  try {
    $indexPage = (Invoke-WebRequest -Uri 'https://wampserver.aviatechno.net/files/php/' -UseBasicParsing -TimeoutSec 20).Content
    $m = [regex]::Match($indexPage, 'href="(php8\.[34]\.\d+_x64_apache2\.4\.zip)"')
    if ($m.Success) { $url = "https://wampserver.aviatechno.net/files/php/$($m.Groups[1].Value)" }
  } catch {}
  if (-not $url) { $url = 'https://wampserver.aviatechno.net/files/php/php8.3.20_x64_apache2.4.zip' }

  $zip = Join-Path $env:TEMP 'php_wamp.zip'
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath (Join-Path $wampDir 'bin\php') -Force
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
  Write-Host "PHP addon installed. Restart WampServer to activate."
  return
}

# Standalone PHP - zip-only, no GUI installer
$phpDir = 'C:\PHP'
$page   = (Invoke-WebRequest -Uri 'https://windows.php.net/downloads/releases/' -UseBasicParsing -TimeoutSec 20).Content
$matches = [regex]::Matches($page, '(?<=href=")/downloads/releases/(php-8\.\d+\.\d+-nts-Win32-vs\d+-x64\.zip)')
if ($matches.Count -eq 0) { throw 'Could not parse PHP download from windows.php.net' }
$filename = $matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Descending | Select-Object -First 1

$zip = Join-Path $env:TEMP 'php_standalone.zip'
Write-Host "Downloading $filename..."
Invoke-WebRequest -Uri "https://windows.php.net/downloads/releases/$filename" -OutFile $zip -UseBasicParsing

New-Item -ItemType Directory -Force -Path $phpDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $phpDir -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

if (Test-Path (Join-Path $phpDir 'php.ini-development')) {
  Copy-Item (Join-Path $phpDir 'php.ini-development') (Join-Path $phpDir 'php.ini') -Force
}
$sysPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
if ($sysPath -notlike "*$phpDir*") {
  [Environment]::SetEnvironmentVariable('Path', "$phpDir;$sysPath", 'Machine')
}
Write-Host "PHP installed at $phpDir. Edit php.ini to enable extensions you need."
