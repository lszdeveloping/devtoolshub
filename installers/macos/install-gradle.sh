#!/usr/bin/env bash
set -e
brew install gradle
echo "Gradle installed: $(gradle --version | head -1)"
