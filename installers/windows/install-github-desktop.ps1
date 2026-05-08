#Requires -RunAsAdministrator
Write-Host "Installing GitHub Desktop..."
$url = "https://central.github.com/deployments/desktop/desktop/latest/win32"
$installer = "$env:TEMP\GitHubDesktopSetup.exe"
Write-Host "Downloading GitHub Desktop (latest)..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "--silent" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
Write-Host "GitHub Desktop installed"
