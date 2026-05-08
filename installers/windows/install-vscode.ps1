#Requires -RunAsAdministrator
Write-Host "Installing Visual Studio Code..."
$url = "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64"
$installer = "$env:TEMP\VSCodeSetup-x64.exe"
Write-Host "Downloading VS Code (latest stable)..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "/VERYSILENT /NORESTART /MERGETASKS=!runcode,addcontextmenufiles,addcontextmenufolders,associatewithfiles,addtopath" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "VS Code installed"
