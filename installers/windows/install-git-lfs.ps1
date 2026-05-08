#Requires -RunAsAdministrator
Write-Host "Installing Git LFS..."
$release = Invoke-RestMethod "https://api.github.com/repos/git-lfs/git-lfs/releases/latest"
$asset = $release.assets | Where-Object { $_.name -like "*windows-amd64*.zip" } | Select-Object -First 1
if (-not $asset) { Write-Error "Could not find Git LFS asset"; exit 1 }
$zip = "$env:TEMP\git-lfs.zip"
$dir = "$env:TEMP\git-lfs-install"
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Expand-Archive -Path $zip -DestinationPath $dir -Force
$lfsExe = Get-ChildItem -Path $dir -Recurse -Filter "git-lfs.exe" | Select-Object -First 1
if (-not $lfsExe) { Write-Error "git-lfs.exe not found in archive"; exit 1 }
$gitBin = "C:\Program Files\Git\mingw64\bin"
$dest = if (Test-Path $gitBin) { $gitBin } else { "C:\Windows\System32" }
Copy-Item $lfsExe.FullName "$dest\git-lfs.exe" -Force
Remove-Item $zip, $dir -Recurse -ErrorAction SilentlyContinue
git lfs install
Write-Host "Git LFS installed: $(git lfs version)"
