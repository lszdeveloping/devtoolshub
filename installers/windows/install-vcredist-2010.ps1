#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: aviatechno.net VC++ archive (WampServer companion mirror)
# https://wampserver.aviatechno.net/?lang=en
Write-Host "Downloading Visual C++ 2010 SP1 Redistributable (x86 + x64)..."

foreach ($file in @('vcredist_2010_sp1_x86.exe', 'vcredist_2010_sp1_x64.exe')) {
  $dest = Join-Path $env:TEMP $file
  Invoke-WebRequest -Uri "https://wampserver.aviatechno.net/files/vcpackages/$file" -OutFile $dest -UseBasicParsing
  Write-Host "Launching $file..."
  Start-Process -FilePath $dest -Wait
  Remove-Item $dest -Force -ErrorAction SilentlyContinue
}
