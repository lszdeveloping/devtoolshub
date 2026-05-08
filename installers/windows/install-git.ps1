#Requires -RunAsAdministrator
Write-Host "Installing Git..."
$release = Invoke-RestMethod "https://api.github.com/repos/git-for-windows/git/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match "Git-[\d.]+-64-bit\.exe" } | Select-Object -First 1
if (-not $asset) { Write-Error "Could not find Git installer asset"; exit 1 }
$installer = "$env:TEMP\git-setup.exe"
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Git installed: $(git --version)"
