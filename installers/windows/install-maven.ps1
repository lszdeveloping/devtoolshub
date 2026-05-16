#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Source: Apache Maven official CDN
# https://maven.apache.org/download.cgi
Write-Host "Downloading Apache Maven (zip-only - extracted programmatically)..."

$meta = [xml](Invoke-WebRequest 'https://repo.maven.apache.org/maven2/org/apache/maven/maven-core/maven-metadata.xml' -UseBasicParsing).Content
$version = ($meta.metadata.versioning.versions.version | Where-Object { $_ -match '^3\.\d+\.\d+$' } |
            Sort-Object { [Version]$_ } -Descending | Select-Object -First 1)
if (-not $version) { $version = '3.9.9' }

$zip        = Join-Path $env:TEMP "apache-maven-$version-bin.zip"
$installDir = Join-Path $env:ProgramFiles 'Apache Maven'

Invoke-WebRequest -Uri "https://dlcdn.apache.org/maven/maven-3/$version/binaries/apache-maven-$version-bin.zip" -OutFile $zip -UseBasicParsing
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $installDir -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

$mavenHome = Join-Path $installDir "apache-maven-$version"
$bin       = Join-Path $mavenHome 'bin'
[Environment]::SetEnvironmentVariable('MAVEN_HOME', $mavenHome, 'Machine')
$sysPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
if ($sysPath -notlike "*$bin*") {
  [Environment]::SetEnvironmentVariable('Path', "$sysPath;$bin", 'Machine')
}
Write-Host "Maven installed at $mavenHome. Open a new terminal and run 'mvn --version'."
