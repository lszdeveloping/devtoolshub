#!/usr/bin/env bash
set -e
sudo apt-get update -qq
sudo apt-get install -y git
echo "Git installed: $(git --version)"
