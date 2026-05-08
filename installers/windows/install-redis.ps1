#Requires -RunAsAdministrator
Write-Host "Installing Redis for Windows..."
$release = Invoke-RestMethod "https://api.github.com/repos/tporadowski/redis/releases/latest"
$asset = $release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1
if (-not $asset) { Write-Error "Could not find Redis Windows installer"; exit 1 }
$msi = "$env:TEMP\redis-setup.msi"
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Redis installed"
