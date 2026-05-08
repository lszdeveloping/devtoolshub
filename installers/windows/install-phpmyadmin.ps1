#Requires -RunAsAdministrator
Write-Host "Installing phpMyAdmin (WampServer addon)..."

$wampDir = "C:\wamp64"
$isWamp  = Test-Path "$wampDir\wampmanager.exe"

if ($isWamp) {
  Write-Host "WampServer detected  -  installing phpMyAdmin 5.2.2 as addon..."
  $url = "https://wampserver.aviatechno.net/files/phpmyadmin/phpmyadmin5.2.2.zip"
  $zip = "$env:TEMP\phpmyadmin5.2.2.zip"
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath "$wampDir\apps" -Force
  Remove-Item $zip -ErrorAction SilentlyContinue
  Write-Host "phpMyAdmin 5.2.2 addon installed. Restart WampServer to activate."
} else {
  Write-Host "phpMyAdmin requires WampServer. Installing WampServer first is recommended."
  Write-Host "Alternatively, download phpMyAdmin from https://www.phpmyadmin.net/downloads/"
  exit 1
}
