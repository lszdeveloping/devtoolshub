#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: aviatechno.net VC++ archive (WampServer companion bundle)
# https://wampserver.aviatechno.net/?lang=en
Write-Host "Downloading all Visual C++ Redistributables required by WampServer..."

$base = 'https://wampserver.aviatechno.net/files/vcpackages'
$packages = @(
  @{ file = 'vcredist_2010_sp1_x86.exe';  label = 'VC++ 2010 SP1 x86' }
  @{ file = 'vcredist_2010_sp1_x64.exe';  label = 'VC++ 2010 SP1 x64' }
  @{ file = 'vcredist_2012_upd4_x86.exe'; label = 'VC++ 2012 Update 4 x86' }
  @{ file = 'vcredist_2012_upd4_x64.exe'; label = 'VC++ 2012 Update 4 x64' }
  @{ file = 'vcredist_2013_upd5_x86.exe'; label = 'VC++ 2013 Update 5 x86' }
  @{ file = 'vcredist_2013_upd5_x64.exe'; label = 'VC++ 2013 Update 5 x64' }
  @{ file = 'vcredist_V14_x86.exe';       label = 'VC++ 2015-2022 x86' }
  @{ file = 'vcredist_V14_x64.exe';       label = 'VC++ 2015-2022 x64' }
)

foreach ($pkg in $packages) {
  $dest = Join-Path $env:TEMP $pkg.file
  Write-Host "Downloading $($pkg.label)..."
  try {
    Invoke-WebRequest -Uri "$base/$($pkg.file)" -OutFile $dest -UseBasicParsing
    Write-Host "Launching $($pkg.label)..."
    Start-Process -FilePath $dest -Wait
  } catch {
    Write-Warning "Failed $($pkg.label): $_"
  } finally {
    Remove-Item $dest -Force -ErrorAction SilentlyContinue
  }
}
