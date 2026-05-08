#!/usr/bin/env bash
set -e
GRADLE_VER="8.7"
wget -q "https://services.gradle.org/distributions/gradle-${GRADLE_VER}-bin.zip" -O /tmp/gradle.zip
sudo unzip -q /tmp/gradle.zip -d /opt/gradle
sudo ln -sf /opt/gradle/gradle-${GRADLE_VER}/bin/gradle /usr/local/bin/gradle
echo "Gradle installed: $(gradle --version | head -1)"
