#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
Write-Host "Installing MySQL 8.0..."

$wampDir = "C:\wamp64"
$isWamp  = Test-Path "$wampDir\wampmanager.exe"

if ($isWamp) {
  $mysqlBinDir = Get-ChildItem "$wampDir\bin\mysql" -ErrorAction SilentlyContinue |
                 Where-Object { $_.PSIsContainer } |
                 Sort-Object Name -Descending |
                 Select-Object -First 1

  if ($mysqlBinDir) {
    Write-Host "WampServer detected - MySQL already present: $($mysqlBinDir.Name)"
    Write-Host "Add '$($mysqlBinDir.FullName)\bin' to PATH if needed."
    exit 0
  }
}

$url = "https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.40-winx64.msi"
$msi = "$env:TEMP\mysql-setup.msi"
Write-Host "Downloading MySQL 8.0.40..."
Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "MySQL installed."
