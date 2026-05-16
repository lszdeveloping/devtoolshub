#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Sources:
# - VC++ prereqs: https://wampserver.aviatechno.net/files/vcpackages
# - WampServer:   https://wampserver.aviatechno.net/files/install (primary)
#                 https://sourceforge.net/projects/wampserver (fallback)
Write-Host "Downloading WampServer prerequisites and installer..."

function Install-Vc([string]$file, [string]$label) {
  $dest = Join-Path $env:TEMP $file
  Write-Host "Downloading $label..."
  try {
    Invoke-WebRequest -Uri "https://wampserver.aviatechno.net/files/vcpackages/$file" -OutFile $dest -UseBasicParsing
    Write-Host "Launching $label..."
    Start-Process -FilePath $dest -Wait
  } catch {
    Write-Warning "Failed $label : $_"
  } finally {
    Remove-Item $dest -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Step 1/2 - Visual C++ Redistributables..."
Install-Vc 'vcredist_2010_sp1_x86.exe'  'VC++ 2010 SP1 x86'
Install-Vc 'vcredist_2010_sp1_x64.exe'  'VC++ 2010 SP1 x64'
Install-Vc 'vcredist_2012_upd4_x86.exe' 'VC++ 2012 Update 4 x86'
Install-Vc 'vcredist_2012_upd4_x64.exe' 'VC++ 2012 Update 4 x64'
Install-Vc 'vcredist_2013_upd5_x86.exe' 'VC++ 2013 Update 5 x86'
Install-Vc 'vcredist_2013_upd5_x64.exe' 'VC++ 2013 Update 5 x64'
Install-Vc 'vcredist_V14_x86.exe'       'VC++ 2015-2022 x86'
Install-Vc 'vcredist_V14_x64.exe'       'VC++ 2015-2022 x64'

Write-Host "Step 2/2 - WampServer 3.4.0 installer..."
$dest = Join-Path $env:TEMP 'wampserver3.4.0_x64.exe'
try {
  Invoke-WebRequest -Uri 'https://wampserver.aviatechno.net/files/install/wampserver3.4.0_x64.exe' -OutFile $dest -UseBasicParsing
} catch {
  Write-Warning "Primary mirror failed: $_ - trying SourceForge..."
  Invoke-WebRequest -Uri 'https://sourceforge.net/projects/wampserver/files/latest/download' -OutFile $dest -UseBasicParsing
}

Write-Host "Launching WampServer installer - configure install path and browser/editor in the wizard..."
Start-Process -FilePath $dest -Wait
Remove-Item $dest -Force -ErrorAction SilentlyContinue
