#!/usr/bin/env bash
set -e
sudo apt-get update -qq && sudo apt-get install -y maven
echo "Maven installed: $(mvn --version | head -1)"
