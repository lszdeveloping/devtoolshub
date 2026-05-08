#Requires -RunAsAdministrator
Write-Host "Installing Visual C++ 2015-2022 Redistributable (x86 + x64)..."

Write-Host "Downloading VC++ 2015-2022 x86..."
$x86 = "$env:TEMP\vc_redist.x86.exe"
Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x86.exe" -OutFile $x86 -UseBasicParsing
Start-Process $x86 -ArgumentList "/quiet /norestart" -Wait -NoNewWindow
Remove-Item $x86 -ErrorAction SilentlyContinue

Write-Host "Downloading VC++ 2015-2022 x64..."
$x64 = "$env:TEMP\vc_redist.x64.exe"
Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile $x64 -UseBasicParsing
Start-Process $x64 -ArgumentList "/quiet /norestart" -Wait -NoNewWindow
Remove-Item $x64 -ErrorAction SilentlyContinue

Write-Host "VC++ 2015-2022 Redistributable installed."
