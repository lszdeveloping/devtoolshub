#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official Microsoft permalinks (latest VS 2015-2022 redistributables)
# https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
Write-Host "Downloading Visual C++ 2015-2022 Redistributable (x86 + x64)..."

$assets = @{
  'vc_redist.x86.exe' = 'https://aka.ms/vs/17/release/vc_redist.x86.exe'
  'vc_redist.x64.exe' = 'https://aka.ms/vs/17/release/vc_redist.x64.exe'
}
foreach ($name in $assets.Keys) {
  $dest = Join-Path $env:TEMP $name
  Invoke-WebRequest -Uri $assets[$name] -OutFile $dest -UseBasicParsing
  Write-Host "Launching $name..."
  Start-Process -FilePath $dest -Wait
  Remove-Item $dest -Force -ErrorAction SilentlyContinue
}
