Write-Host "Installing RTK..."
$installDir = "$env:LOCALAPPDATA\rtk\bin"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
$zip = "$env:TEMP\rtk.zip"
Invoke-WebRequest -Uri "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip" -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $installDir -Force
Remove-Item $zip
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
    $env:Path += ";$installDir"
}
if (Test-Path "$installDir\rtk.exe") { Write-Host "RTK installed" } else { exit 1 }
