#Requires -RunAsAdministrator
Write-Host "Installing Java JDK 21 (Eclipse Temurin)..."
$api = "https://api.adoptium.net/v3/assets/latest/21/hotspot?os=windows&architecture=x64&image_type=jdk"
$release = Invoke-RestMethod $api
$installerUrl = $release[0].binary.installer.link
$msi = "$env:TEMP\jdk21-setup.msi"
Write-Host "Downloading JDK 21..."
Invoke-WebRequest -Uri $installerUrl -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart ADDLOCAL=FeatureMain,FeatureEnvironment,FeatureJarFileRunWith,FeatureJavaHome" -Wait -NoNewWindow
Remove-Item $msi -ErrorAction SilentlyContinue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Java installed: $(java --version)"
