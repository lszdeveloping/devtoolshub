#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Sources:
# - WampServer addon: https://wampserver.aviatechno.net/files/mariadb/
# - Standalone:       https://downloads.mariadb.org/rest-api/mariadb/ (official REST API)
Write-Host "Installing MariaDB 11.4..."

$wampDir = 'C:\wamp64'
if (Test-Path (Join-Path $wampDir 'wampmanager.exe')) {
  Write-Host "WampServer detected - installing MariaDB 11.4.5 as addon..."
  $zip = Join-Path $env:TEMP 'mariadb11.4.5-x64.zip'
  Invoke-WebRequest -Uri 'https://wampserver.aviatechno.net/files/mariadb/mariadb11.4.5-x64.zip' -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath (Join-Path $wampDir 'bin\mariadb') -Force
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
  Write-Host "MariaDB addon installed. Restart WampServer to activate."
  return
}

Write-Host "Downloading standalone MariaDB 11.4 installer..."
$releases = Invoke-RestMethod 'https://downloads.mariadb.org/rest-api/mariadb/11.4/'
$latest = $releases.releases | Where-Object { $_.release_type -eq 'Stable' } | Select-Object -First 1
$file = $latest.files | Where-Object { $_.package_type -eq 'MSI Package' -and $_.cpu -eq 'x86_64' } | Select-Object -First 1
if (-not $file) { throw 'MariaDB MSI not found' }

$msi = Join-Path $env:TEMP "mariadb-$($latest.release_id).msi"
Invoke-WebRequest -Uri $file.file_download_url -OutFile $msi -UseBasicParsing

Write-Host "Launching MariaDB installer - configure root password and ports in the wizard..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
