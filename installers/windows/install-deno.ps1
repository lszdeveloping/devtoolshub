Write-Host "Installing Deno..."
$release = Invoke-RestMethod "https://api.github.com/repos/denoland/deno/releases/latest"
$asset = $release.assets | Where-Object { $_.name -like "*x86_64-pc-windows-msvc.zip" } | Select-Object -First 1
if (-not $asset) { Write-Error "Could not find Deno asset"; exit 1 }
$zip = "$env:TEMP\deno.zip"
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
$denoDir = "$env:USERPROFILE\.deno\bin"
New-Item -ItemType Directory -Force -Path $denoDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $denoDir -Force
Remove-Item $zip -ErrorAction SilentlyContinue
$userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
if ($userPath -notlike "*$denoDir*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$denoDir;$userPath", "User")
}
$env:Path = "$denoDir;$env:Path"
Write-Host "Deno installed: $(deno --version)"
