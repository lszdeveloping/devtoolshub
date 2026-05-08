#Requires -RunAsAdministrator
Write-Host "Installing Docker Desktop..."
$url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installer = "$env:TEMP\DockerDesktopInstaller.exe"
Write-Host "Downloading Docker Desktop (latest stable)..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "install --quiet --accept-license" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
Write-Host "Docker Desktop installed. Restart required to complete setup."
