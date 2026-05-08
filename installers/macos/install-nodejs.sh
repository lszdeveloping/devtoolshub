#!/usr/bin/env bash
set -e
echo "Installing Node.js LTS..."
brew install node@20
brew link --overwrite node@20
echo "Node.js installed: $(node --version)"
