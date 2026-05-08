#Requires -RunAsAdministrator
Write-Host "Installing Postman..."
$url = "https://dl.pstmn.io/download/latest/win64"
$installer = "$env:TEMP\PostmanSetup.exe"
Write-Host "Downloading Postman (latest)..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "--silent" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
Write-Host "Postman installed"
