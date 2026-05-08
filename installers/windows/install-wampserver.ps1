#Requires -RunAsAdministrator
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$base = "https://wampserver.aviatechno.net/files/vcpackages"

function Install-Vc($file, $label) {
  $dest = "$env:TEMP\$file"
  Write-Host "Installing $label..."
  try {
    Invoke-WebRequest -Uri "$base/$file" -OutFile $dest -UseBasicParsing -ErrorAction Stop
    Start-Process -FilePath $dest -ArgumentList "/passive /norestart" -Wait
    Remove-Item $dest -ErrorAction SilentlyContinue
    Write-Host "$label done."
  } catch {
    Write-Warning "Could not install ${label}: $_"
  }
}

# Step 1: Install all required VC++ Redistributables
Write-Host "Step 1/2 - Installing Visual C++ Redistributables..."
Install-Vc "vcredist_2010_sp1_x86.exe" "VC++ 2010 SP1 x86"
Install-Vc "vcredist_2010_sp1_x64.exe" "VC++ 2010 SP1 x64"
Install-Vc "vcredist_2012_upd4_x86.exe" "VC++ 2012 Update 4 x86"
Install-Vc "vcredist_2012_upd4_x64.exe" "VC++ 2012 Update 4 x64"
Install-Vc "vcredist_2013_upd5_x86.exe" "VC++ 2013 Update 5 x86"
Install-Vc "vcredist_2013_upd5_x64.exe" "VC++ 2013 Update 5 x64"
Install-Vc "vcredist_V14_x86.exe"       "VC++ 2015-2022 x86"
Install-Vc "vcredist_V14_x64.exe"       "VC++ 2015-2022 x64"

# Step 2: Download and install WampServer
Write-Host "Step 2/2 - Installing WampServer 3.4.0..."

$dest = "$env:TEMP\wampserver3.4.0_x64.exe"

try {
  Write-Host "Installing WampServer from aviatechno.net..."
  Invoke-WebRequest -Uri "https://wampserver.aviatechno.net/files/install/wampserver3.4.0_x64.exe" -OutFile $dest -UseBasicParsing -ErrorAction Stop
} catch {
  Write-Host "Primary URL failed, trying SourceForge..."
  try {
    Invoke-WebRequest -Uri "https://sourceforge.net/projects/wampserver/files/latest/download" -OutFile $dest -UseBasicParsing -ErrorAction Stop
  } catch {
    Write-Error "Could not download WampServer. Visit https://www.wampserver.com to download manually."
    exit 1
  }
}

Write-Host "Running WampServer installer..."
Start-Process -FilePath $dest -ArgumentList "/VERYSILENT /NORESTART /CLOSEAPPLICATIONS" -Wait
Remove-Item $dest -ErrorAction SilentlyContinue

if (Test-Path "C:\wamp64\wampmanager.exe") {
  Write-Host "WampServer installed at C:\wamp64"
} else {
  Write-Warning "WampServer may not have installed correctly. Re-run as Administrator."
  exit 1
}
