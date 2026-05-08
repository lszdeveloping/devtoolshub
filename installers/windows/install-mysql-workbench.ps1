#Requires -RunAsAdministrator
Write-Host "Installing MySQL Workbench 8.0..."
$url = "https://dev.mysql.com/get/Downloads/MySQLGUITools/mysql-workbench-community-8.0.40-winx64.msi"
$msi = "$env:TEMP\mysql-workbench-setup.msi"
Write-Host "Downloading MySQL Workbench 8.0.40..."
Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
Write-Host "MySQL Workbench installed."
