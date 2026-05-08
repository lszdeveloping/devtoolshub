#!/usr/bin/env bash
set -e
sudo apt-get update -qq
sudo apt-get install -y temurin-21-jdk 2>/dev/null || {
    wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor | sudo tee /usr/share/keyrings/adoptium.gpg > /dev/null
    echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
    sudo apt-get update -qq && sudo apt-get install -y temurin-21-jdk
}
echo "Java installed: $(java --version | head -1)"
