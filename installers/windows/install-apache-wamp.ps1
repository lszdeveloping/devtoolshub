#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: aviatechno.net WampServer Apache addons
# https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en
Write-Host "Installing Apache addon for WampServer..."

$wampDir = 'C:\wamp64'
if (-not (Test-Path (Join-Path $wampDir 'wampmanager.exe'))) {
  throw "WampServer must be installed first at $wampDir"
}

function Resolve-ApacheAddonUrl {
  $fallback = 'https://wampserver.aviatechno.net/files/apache/wampserver3_addon_apache2.4.67_fcgi_x64.exe'
  try {
    $base = [Uri]'https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en'
    $html = (Invoke-WebRequest -Uri $base.AbsoluteUri -UseBasicParsing -TimeoutSec 20).Content
    $matches = [regex]::Matches($html, 'href="([^"]*wampserver3(?:_x64)?_addon_apache[\d.]+(?:_fcgi)?(?:_x64)?\.exe)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($matches.Count -gt 0) {
      $href = $matches[$matches.Count - 1].Groups[1].Value
      return [Uri]::new($base, $href).AbsoluteUri
    }
  } catch {
    Write-Warning "Could not detect latest Apache addon automatically: $_"
  }
  return $fallback
}

$url = Resolve-ApacheAddonUrl
$installer = Join-Path $env:TEMP 'wamp-apache-addon.exe'
Write-Host "Downloading Apache addon..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing

Write-Host "Launching Apache addon installer - follow the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue

Write-Host "Apache addon installed. Restart WampServer to activate."
