#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: official MySQL Workbench Community CDN
# https://dev.mysql.com/downloads/workbench/
# dev.mysql.com/get/ redirect layer is flaky (returns fw_error_www HTML); cdn.mysql.com serves
# the MSI directly. Try multiple recent versions because Oracle prunes old MSIs from the CDN.
Write-Host "Downloading MySQL Workbench installer..."

$msi = Join-Path $env:TEMP 'mysql-workbench.msi'
$versions = @('8.0.42', '8.0.41', '8.0.40', '8.0.39', '8.0.38')
$downloaded = $false
foreach ($v in $versions) {
  $url = "https://cdn.mysql.com/Downloads/MySQLGUITools/mysql-workbench-community-$v-winx64.msi"
  try {
    Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
    Write-Host "Downloaded MySQL Workbench $v"
    $downloaded = $true
    break
  } catch {
    Write-Host "Version $v not available, trying next..."
  }
}
if (-not $downloaded) { throw 'No MySQL Workbench MSI found on cdn.mysql.com' }

Write-Host "Launching MySQL Workbench installer..."
Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$msi`"") -Wait
Remove-Item $msi -Force -ErrorAction SilentlyContinue
