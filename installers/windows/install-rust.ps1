#Requires -RunAsAdministrator
Write-Host "Installing Rust..."
$installer = "$env:TEMP\rustup-init.exe"
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $installer
& $installer -y --default-toolchain stable
if ($LASTEXITCODE -eq 0) {
    $env:Path += ";$env:USERPROFILE\.cargo\bin"
    [System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
    Write-Host "Rust installed: $(rustc --version)"
} else { exit 1 }
