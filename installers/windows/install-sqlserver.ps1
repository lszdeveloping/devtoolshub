#Requires -RunAsAdministrator
Write-Host "Installing SQL Server Express 2022..."
$url = "https://download.microsoft.com/download/5/1/4/5145fe04-4d30-4b85-b0d1-39533663a2f1/SQL2022-SSEI-Expr.exe"
$dest = "$env:TEMP\SQL2022-SSEI-Expr.exe"
Write-Host "Downloading SQL Server Express 2022..."
Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
Start-Process $dest -ArgumentList "/ACTION=Install /FEATURES=SQLEngine /INSTANCENAME=SQLEXPRESS /SQLSVCACCOUNT=`"NT AUTHORITY\SYSTEM`" /SQLSYSADMINACCOUNTS=`"BUILTIN\Administrators`" /AGTSVCACCOUNT=`"NT AUTHORITY\Network Service`" /IACCEPTSQLSERVERLICENSETERMS /QUIET" -Wait -NoNewWindow
Remove-Item $dest -ErrorAction SilentlyContinue
Write-Host "SQL Server Express 2022 installed."
Write-Host "Note: Open SQL Server Configuration Manager to start the service if needed."
