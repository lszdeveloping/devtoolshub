#Requires -RunAsAdministrator
Write-Host "Installing PostgreSQL 16..."
$url = "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64.exe"
$installer = "$env:TEMP\postgresql-setup.exe"
Write-Host "Downloading PostgreSQL 16.6..."
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Start-Process $installer -ArgumentList "--unattendedmodeui none --mode unattended --superpassword postgres --serverport 5432 --servicename postgresql-16" -Wait -NoNewWindow
Remove-Item $installer -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "PostgreSQL installed. Default password: postgres | Port: 5432"
