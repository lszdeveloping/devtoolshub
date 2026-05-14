#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: aviatechno.net WampServer Adminer applications
# https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en
Write-Host "Installing Adminer addon for WampServer..."

$wampDir = 'C:\wamp64'
if (-not (Test-Path (Join-Path $wampDir 'wampmanager.exe'))) {
  Write-Error 'Adminer addon requires WampServer. Install WampServer first.'
  exit 1
}

function Resolve-AdminerUrl {
  $fallback = 'https://wampserver.aviatechno.net/files/adminer/wampserver3_x64_adminer5.4.2.exe'
  try {
    $base = [Uri]'https://wampserver.aviatechno.net/index.php?affiche=addons&lang=en'
    $html = (Invoke-WebRequest -Uri $base.AbsoluteUri -UseBasicParsing -TimeoutSec 20).Content
    $matches = [regex]::Matches($html, 'href="([^"]*wampserver3(?:_x64)?_adminer[\d.]+\.exe)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($matches.Count -gt 0) {
      $href = $matches[$matches.Count - 1].Groups[1].Value
      return [Uri]::new($base, $href).AbsoluteUri
    }
  } catch {
    Write-Warning "Could not detect latest Adminer addon automatically: $_"
  }
  return $fallback
}

$url = Resolve-AdminerUrl
$installer = Join-Path $env:TEMP 'wamp-adminer-addon.exe'
Write-Host "Downloading Adminer addon..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing

Write-Host "Launching Adminer addon installer - follow the wizard..."
Start-Process -FilePath $installer -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue

Write-Host "Adminer addon installed. Restart WampServer to activate."
