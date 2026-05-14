#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Microsoft Download Center
# https://support.microsoft.com/en-us/topic/update-for-visual-c-2013-redistributable-package-d8ccd6a5-4e26-c290-517b-8da6cfdf4f10
Write-Host "Downloading Visual C++ 2013 Redistributable (x86 + x64)..."

$assets = @{
  'vcredist_2013_x86.exe' = 'https://download.microsoft.com/download/2/E/6/2E61CFA4-993B-4DD4-91DA-3737CD5CD6E3/vcredist_x86.exe'
  'vcredist_2013_x64.exe' = 'https://download.microsoft.com/download/2/E/6/2E61CFA4-993B-4DD4-91DA-3737CD5CD6E3/vcredist_x64.exe'
}
foreach ($name in $assets.Keys) {
  $dest = Join-Path $env:TEMP $name
  Invoke-WebRequest -Uri $assets[$name] -OutFile $dest -UseBasicParsing
  Write-Host "Launching $name..."
  Start-Process -FilePath $dest -Wait
  Remove-Item $dest -Force -ErrorAction SilentlyContinue
}
