#Requires -RunAsAdministrator
Write-Host "Installing Visual C++ 2008 Redistributable (x86)..."

$url  = "https://download.microsoft.com/download/5/D/8/5D8C65CB-C849-4025-8E95-C3966CAFD8AE/vcredist_x86.exe"
$file = "$env:TEMP\vcredist_2008_x86.exe"

Write-Host "Downloading VC++ 2008 x86..."
Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing
Write-Host "Installing VC++ 2008 x86..."
Start-Process -FilePath $file -ArgumentList "/passive /norestart" -Wait
Remove-Item $file -ErrorAction SilentlyContinue
Write-Host "Visual C++ 2008 Redistributable installed."
