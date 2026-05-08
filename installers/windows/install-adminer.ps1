#Requires -RunAsAdministrator
Write-Host "Installing Adminer (WampServer addon or standalone)..."

$wampDir = "C:\wamp64"
$isWamp  = Test-Path "$wampDir\wampmanager.exe"

if ($isWamp) {
  Write-Host "WampServer detected  -  installing Adminer 4.8.1 as addon..."
  $url = "https://wampserver.aviatechno.net/files/adminer/adminer4.8.1.zip"
  $zip = "$env:TEMP\adminer4.8.1.zip"
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath "$wampDir\apps" -Force
  Remove-Item $zip -ErrorAction SilentlyContinue
  Write-Host "Adminer 4.8.1 addon installed. Restart WampServer to activate."
} else {
  # Standalone: place adminer.php in a web-accessible directory
  $destDir = "$env:USERPROFILE\adminer"
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  $url = "https://www.adminer.org/static/download/4.8.1/adminer-4.8.1.php"
  Invoke-WebRequest -Uri $url -OutFile "$destDir\adminer.php" -UseBasicParsing
  Write-Host "Adminer downloaded to $destDir\adminer.php"
  Write-Host "Place it in your web server's document root to use it."
}
