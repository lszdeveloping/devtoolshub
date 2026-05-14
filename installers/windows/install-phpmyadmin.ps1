#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: aviatechno.net WampServer phpMyAdmin applications
# https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en
Write-Host "Installing phpMyAdmin addon for WampServer..."

$wampDir = 'C:\wamp64'
if (-not (Test-Path (Join-Path $wampDir 'wampmanager.exe'))) {
  Write-Error 'phpMyAdmin requires WampServer. Install WampServer first.'
  exit 1
}

function Resolve-PhpMyAdminUrl {
  $fallback = 'https://wampserver.aviatechno.net/files/phpmyadmin/wampserver3_x64_addon_phpmyadmin5.2.3.exe'
  try {
    $base = [Uri]'https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en'
    $html = (Invoke-WebRequest -Uri $base.AbsoluteUri -UseBasicParsing -TimeoutSec 20).Content
    $matches = [regex]::Matches($html, 'href="([^"]*wampserver3(?:_x64)?_addon_phpmyadmin[\d.]+\.exe)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($matches.Count -gt 0) {
      $href = $matches[$matches.Count - 1].Groups[1].Value
      return [Uri]::new($base, $href).AbsoluteUri
    }
  } catch {
    Write-Warning "Could not detect latest phpMyAdmin addon automatically: $_"
  }
  return $fallback
}

$url = Resolve-PhpMyAdminUrl
$installer = Join-Path $env:TEMP 'wamp-phpmyadmin-addon.exe'
Write-Host "Downloading phpMyAdmin addon..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing

Write-Host "Launching phpMyAdmin addon installer - follow the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue

Write-Host "phpMyAdmin addon installed. Restart WampServer to activate."
