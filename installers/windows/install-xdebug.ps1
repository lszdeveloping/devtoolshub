#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: aviatechno.net WampServer xDebug updates
# https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en
Write-Host "Installing xDebug update for WampServer..."

$wampDir = 'C:\wamp64'
if (-not (Test-Path (Join-Path $wampDir 'wampmanager.exe'))) {
  Write-Host 'xDebug installer here targets WampServer.'
  Write-Host 'For standalone PHP, run: pecl install xdebug'
  exit 1
}

function Resolve-XDebugUrl {
  $fallback = 'https://wampserver.aviatechno.net/files/xdebug/wampserver3_x64_xdebug3.5.1.exe'
  try {
    $base = [Uri]'https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en'
    $html = (Invoke-WebRequest -Uri $base.AbsoluteUri -UseBasicParsing -TimeoutSec 20).Content
    $matches = [regex]::Matches($html, 'href="([^"]*wampserver3(?:_x64)?_xdebug[\d.]+\.exe)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($matches.Count -gt 0) {
      $href = $matches[$matches.Count - 1].Groups[1].Value
      return [Uri]::new($base, $href).AbsoluteUri
    }
  } catch {
    Write-Warning "Could not detect latest xDebug update automatically: $_"
  }
  return $fallback
}

$url = Resolve-XDebugUrl
$installer = Join-Path $env:TEMP 'wamp-xdebug-update.exe'
Write-Host "Downloading xDebug update..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing

Write-Host "Launching xDebug update installer - follow the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue

Write-Host "xDebug update installed. Restart WampServer to activate."
