#Requires -RunAsAdministrator
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Host "Installing Visual C++ 2010 SP1 Redistributable (x86 + x64)..."

$base = "https://wampserver.aviatechno.net/files/vcpackages"

foreach ($file in @("vcredist_2010_sp1_x86.exe", "vcredist_2010_sp1_x64.exe")) {
  $dest = "$env:TEMP\$file"
  Write-Host "Installing $file..."
  Invoke-WebRequest -Uri "$base/$file" -OutFile $dest -UseBasicParsing
  Start-Process -FilePath $dest -ArgumentList "/passive /norestart" -Wait
  Remove-Item $dest -ErrorAction SilentlyContinue
}
Write-Host "VC++ 2010 SP1 Redistributable installed."
