#Requires -RunAsAdministrator
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Installing PHP..."

$wampDir = "C:\wamp64"
$isWamp  = Test-Path "$wampDir\wampmanager.exe"

if ($isWamp) {
  Write-Host "WampServer detected - installing PHP addon..."
  try {
    $indexPage = (Invoke-WebRequest -Uri "https://wampserver.aviatechno.net/files/php/" -UseBasicParsing -TimeoutSec 20).Content
    $m = [regex]::Match($indexPage, 'href="(php8\.[34]\.\d+_x64_apache2\.4\.zip)"')
    if ($m.Success) {
      $filename = $m.Groups[1].Value
      $url = "https://wampserver.aviatechno.net/files/php/$filename"
      Write-Host "Found: $filename"
    } else {
      throw "No PHP addon found on index page"
    }
  } catch {
    $url = "https://wampserver.aviatechno.net/files/php/php8.3.20_x64_apache2.4.zip"
    Write-Host "Using fallback URL."
  }

  $zip = "$env:TEMP\php_wamp.zip"
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath "$wampDir\bin\php" -Force
  Remove-Item $zip -ErrorAction SilentlyContinue
  Write-Host "PHP addon installed. Restart WampServer to activate."

} else {
  $phpDir = "C:\PHP"
  $url    = $null

  Write-Host "Checking windows.php.net for latest PHP..."
  try {
    $page = (Invoke-WebRequest -Uri "https://windows.php.net/download/" -UseBasicParsing -TimeoutSec 20).Content
    $m    = [regex]::Match($page, '(https://downloads\.php\.net/~windows/releases/(?:archives/)?php-8\.\d+\.\d+-nts-Win32-vs\d+-x64\.zip)')
    if ($m.Success) {
      $url = $m.Groups[1].Value
      Write-Host "Found: $($url.Split('/')[-1])"
    }
  } catch {
    Write-Host "Could not parse download page."
  }

  if (-not $url) {
    Write-Error "Could not determine PHP download URL. Visit https://windows.php.net/download/ to install manually."
    exit 1
  }

  $zip = "$env:TEMP\php_standalone.zip"
  Write-Host "Installing PHP..."
  try {
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -ErrorAction Stop
  } catch {
    Write-Error "Download failed: $_"
    exit 1
  }

  Write-Host "Extracting to $phpDir..."
  New-Item -ItemType Directory -Force -Path $phpDir | Out-Null
  Expand-Archive -Path $zip -DestinationPath $phpDir -Force
  Remove-Item $zip -ErrorAction SilentlyContinue

  if (Test-Path "$phpDir\php.ini-development") {
    Copy-Item "$phpDir\php.ini-development" "$phpDir\php.ini" -Force
  }

  $syspath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  if ($syspath -notlike "*$phpDir*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$phpDir;$syspath", "Machine")
    Write-Host "Added $phpDir to system PATH."
  }
  $env:Path = "$phpDir;" + $env:Path

  $ver = & "$phpDir\php.exe" --version 2>&1 | Select-Object -First 1
  Write-Host "PHP installed: $ver"
}
