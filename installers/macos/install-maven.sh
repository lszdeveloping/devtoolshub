#!/usr/bin/env bash
set -e
brew install maven
echo "Maven installed: $(mvn --version | head -1)"
