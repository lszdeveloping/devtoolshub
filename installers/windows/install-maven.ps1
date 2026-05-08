#Requires -RunAsAdministrator
Write-Host "Installing Apache Maven..."
$version = "3.9.9"
$url = "https://dlcdn.apache.org/maven/maven-3/$version/binaries/apache-maven-$version-bin.zip"
$zip = "$env:TEMP\apache-maven-$version-bin.zip"
$installDir = "C:\Program Files\Apache Maven"
Write-Host "Downloading Maven $version..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $installDir -Force
Remove-Item $zip -ErrorAction SilentlyContinue
$mavenBin = "$installDir\apache-maven-$version\bin"
[System.Environment]::SetEnvironmentVariable("MAVEN_HOME", "$installDir\apache-maven-$version", "Machine")
$syspath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
if ($syspath -notlike "*$mavenBin*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$syspath;$mavenBin", "Machine")
}
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Maven installed: $(mvn --version)"
