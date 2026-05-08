#Requires -RunAsAdministrator
Write-Host "Installing MariaDB 11.4..."

$wampDir = "C:\wamp64"
$isWamp  = Test-Path "$wampDir\wampmanager.exe"

if ($isWamp) {
  Write-Host "WampServer detected - installing MariaDB 11.4.5 as addon..."
  $url = "https://wampserver.aviatechno.net/files/mariadb/mariadb11.4.5-x64.zip"
  $zip = "$env:TEMP\mariadb11.4.5-x64.zip"
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath "$wampDir\bin\mariadb" -Force
  Remove-Item $zip -ErrorAction SilentlyContinue
  Write-Host "MariaDB 11.4.5 addon installed. Restart WampServer to activate."
} else {
  Write-Host "Installing standalone MariaDB 11.4..."
  $releases = Invoke-RestMethod "https://downloads.mariadb.org/rest-api/mariadb/11.4/"
  $latest = $releases.releases | Where-Object { $_.release_type -eq "Stable" } | Select-Object -First 1
  $file = $latest.files | Where-Object { $_.package_type -eq "MSI Package" -and $_.cpu -eq "x86_64" } | Select-Object -First 1
  $url = $file.file_download_url
  $msi = "$env:TEMP\mariadb-setup.msi"
  Write-Host "Downloading MariaDB $($latest.release_id)..."
  Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
  Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -NoNewWindow
  Remove-Item $msi -ErrorAction SilentlyContinue
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  Write-Host "MariaDB installed."
}
