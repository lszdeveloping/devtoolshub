#Requires -RunAsAdministrator
# Apache addon for WampServer  -  downloads from wampserver.aviatechno.net
Write-Host "Installing Apache 2.4.67 addon for WampServer..."

$wampDir = "C:\wamp64"
if (-not (Test-Path "$wampDir\wampmanager.exe")) {
  Write-Error "WampServer must be installed first at C:\wamp64"
  exit 1
}

$url  = "https://wampserver.aviatechno.net/files/apache/apache2.4.67-x64.zip"
$zip  = "$env:TEMP\apache2.4.67-x64.zip"

Write-Host "Downloading Apache 2.4.67 addon..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

Write-Host "Extracting..."
Expand-Archive -Path $zip -DestinationPath "$wampDir\bin\apache" -Force
Remove-Item $zip -ErrorAction SilentlyContinue

Write-Host "Apache 2.4.67 addon installed. Restart WampServer to activate."
