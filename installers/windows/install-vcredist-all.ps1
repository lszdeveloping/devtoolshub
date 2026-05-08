#Requires -RunAsAdministrator
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Host "Installing All Visual C++ Redistributables required by WampServer..."

$base = "https://wampserver.aviatechno.net/files/vcpackages"

# Install each package individually (the correct aviatechno.net filenames)
$packages = @(
  @{ file = "vcredist_2010_sp1_x86.exe"; label = "VC++ 2010 SP1 x86" },
  @{ file = "vcredist_2010_sp1_x64.exe"; label = "VC++ 2010 SP1 x64" },
  @{ file = "vcredist_2012_upd4_x86.exe"; label = "VC++ 2012 Update 4 x86" },
  @{ file = "vcredist_2012_upd4_x64.exe"; label = "VC++ 2012 Update 4 x64" },
  @{ file = "vcredist_2013_upd5_x86.exe"; label = "VC++ 2013 Update 5 x86" },
  @{ file = "vcredist_2013_upd5_x64.exe"; label = "VC++ 2013 Update 5 x64" },
  @{ file = "vcredist_V14_x86.exe";       label = "VC++ 2015-2022 x86" },
  @{ file = "vcredist_V14_x64.exe";       label = "VC++ 2015-2022 x64" }
)

foreach ($pkg in $packages) {
  $url  = "$base/$($pkg.file)"
  $dest = "$env:TEMP\$($pkg.file)"
  Write-Host "Installing $($pkg.label)..."
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -ErrorAction Stop
    Start-Process -FilePath $dest -ArgumentList "/passive /norestart" -Wait
    Remove-Item $dest -ErrorAction SilentlyContinue
    Write-Host "$($pkg.label) done."
  } catch {
    Write-Warning "Could not install $($pkg.label): $_"
  }
}

Write-Host "All Visual C++ Redistributables installed."
