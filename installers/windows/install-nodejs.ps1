#Requires -RunAsAdministrator
Write-Host "Installing Node.js LTS..."
$index = Invoke-RestMethod "https://nodejs.org/dist/index.json"
$lts = $index | Where-Object { $_.lts -ne $false } | Select-Object -First 1
$version = $lts.version
$url = "https://nodejs.org/dist/$version/node-$version-x64.msi"
$msi = "$env:TEMP\node-setup.msi"
Write-Host "Downloading Node.js $version..."
Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart ADDLOCAL=ALL" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Node.js installed: $(node --version)"
Write-Host "npm: $(npm --version)"
