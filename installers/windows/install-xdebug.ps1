#Requires -RunAsAdministrator
Write-Host "Installing xDebug (WampServer addon)..."

$wampDir = "C:\wamp64"
$isWamp  = Test-Path "$wampDir\wampmanager.exe"

if ($isWamp) {
  # Detect active PHP version
  $phpDir = Get-ChildItem "$wampDir\bin\php" -Directory | Sort-Object Name -Descending | Select-Object -First 1
  if (-not $phpDir) {
    Write-Error "No PHP installation found under $wampDir\bin\php"
    exit 1
  }
  $phpVersion = $phpDir.Name  # e.g. php8.3.6
  Write-Host "Detected PHP: $phpVersion"

  # xDebug 3.3.2 for PHP 8.x NTS x64 (most common WampServer setup)
  $url = "https://wampserver.aviatechno.net/files/xdebug/xdebug3.3.2-php8.3-nts-x64.zip"
  $zip = "$env:TEMP\xdebug.zip"
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath "$wampDir\bin\php\$($phpDir.Name)\ext" -Force
  Remove-Item $zip -ErrorAction SilentlyContinue

  # Append xdebug config to php.ini if not already present
  $iniPath = "$wampDir\bin\php\$($phpDir.Name)\php.ini"
  if (Test-Path $iniPath) {
    $ini = Get-Content $iniPath -Raw
    if ($ini -notmatch 'xdebug') {
      Add-Content $iniPath "`n[xdebug]`nzend_extension=xdebug`nxdebug.mode=debug`nxdebug.start_with_request=yes`nxdebug.client_port=9003"
      Write-Host "xDebug config added to $iniPath"
    }
  }
  Write-Host "xDebug installed. Restart WampServer to activate."
} else {
  Write-Host "xDebug for WampServer requires WampServer to be installed."
  Write-Host "For standalone PHP, use PECL: pecl install xdebug"
  exit 1
}
