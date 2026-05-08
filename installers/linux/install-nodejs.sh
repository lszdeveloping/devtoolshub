#!/usr/bin/env bash
set -e
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node.js installed: $(node --version)"
