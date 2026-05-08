#Requires -RunAsAdministrator
Write-Host "Installing Python 3.12..."
$url = "https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe"
$installer = "$env:TEMP\python-setup.exe"
Write-Host "Downloading Python 3.12.10..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_test=0 Include_doc=0" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Python installed: $(python --version)"
