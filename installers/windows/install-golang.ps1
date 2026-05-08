#Requires -RunAsAdministrator
Write-Host "Installing Go..."
$releases = Invoke-RestMethod "https://go.dev/dl/?mode=json"
$latest = $releases | Where-Object { $_.stable -eq $true } | Select-Object -First 1
$file = $latest.files | Where-Object { $_.os -eq "windows" -and $_.arch -eq "amd64" -and $_.kind -eq "installer" } | Select-Object -First 1
if (-not $file) { Write-Error "Could not find Go installer"; exit 1 }
$url = "https://go.dev/dl/$($file.filename)"
$msi = "$env:TEMP\go-setup.msi"
Write-Host "Downloading $($file.filename)..."
Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Go installed: $(go version)"
