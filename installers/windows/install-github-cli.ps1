#Requires -RunAsAdministrator
Write-Host "Installing GitHub CLI..."
$release = Invoke-RestMethod "https://api.github.com/repos/cli/cli/releases/latest"
$asset = $release.assets | Where-Object { $_.name -like "*windows_amd64.msi" } | Select-Object -First 1
if (-not $asset) { Write-Error "Could not find GitHub CLI installer asset"; exit 1 }
$msi = "$env:TEMP\gh_windows_amd64.msi"
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "GitHub CLI installed: $(gh --version)"
Write-Host "Run 'gh auth login' to authenticate with GitHub."
