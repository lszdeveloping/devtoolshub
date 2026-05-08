#Requires -RunAsAdministrator
Write-Host "Installing MongoDB 7.0 Community..."
$url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.9-signed.msi"
$msi = "$env:TEMP\mongodb-setup.msi"
Write-Host "Downloading MongoDB 7.0.9..."
Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart ADDLOCAL=ServerService,Client,MonitoringTools,ImportExportTools,MiscellaneousTools" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "MongoDB installed"
