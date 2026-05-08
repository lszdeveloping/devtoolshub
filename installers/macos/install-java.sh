#!/usr/bin/env bash
set -e
echo "Installing Java JDK 21..."
brew install --cask temurin@21
echo "Java installed: $(java --version | head -1)"
