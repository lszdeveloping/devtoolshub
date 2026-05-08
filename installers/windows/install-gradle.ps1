#Requires -RunAsAdministrator
Write-Host "Installing Gradle..."
$current = Invoke-RestMethod "https://services.gradle.org/versions/current"
$version = $current.version
$url = $current.downloadUrl
$zip = "$env:TEMP\gradle-$version-bin.zip"
$installDir = "C:\Program Files\Gradle"
Write-Host "Downloading Gradle $version..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $installDir -Force
Remove-Item $zip -ErrorAction SilentlyContinue
$gradleBin = "$installDir\gradle-$version\bin"
$syspath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
if ($syspath -notlike "*$gradleBin*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$syspath;$gradleBin", "Machine")
}
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Gradle installed: $(gradle --version)"
