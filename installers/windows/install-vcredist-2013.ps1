#Requires -RunAsAdministrator
Write-Host "Installing Visual C++ 2013 Redistributable (x86 + x64)..."

$x86url = "https://download.microsoft.com/download/2/E/6/2E61CFA4-993B-4DD4-91DA-3737CD5CD6E3/vcredist_x86.exe"
$x64url = "https://download.microsoft.com/download/2/E/6/2E61CFA4-993B-4DD4-91DA-3737CD5CD6E3/vcredist_x64.exe"

Write-Host "Downloading VC++ 2013 x86..."
$x86 = "$env:TEMP\vcredist2013_x86.exe"
Invoke-WebRequest -Uri $x86url -OutFile $x86 -UseBasicParsing
Start-Process $x86 -ArgumentList "/quiet /norestart" -Wait -NoNewWindow
Remove-Item $x86 -ErrorAction SilentlyContinue

Write-Host "Downloading VC++ 2013 x64..."
$x64 = "$env:TEMP\vcredist2013_x64.exe"
Invoke-WebRequest -Uri $x64url -OutFile $x64 -UseBasicParsing
Start-Process $x64 -ArgumentList "/quiet /norestart" -Wait -NoNewWindow
Remove-Item $x64 -ErrorAction SilentlyContinue

Write-Host "VC++ 2013 Redistributable installed."
