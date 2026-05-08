#!/usr/bin/env bash
set -e
echo "Installing Go..."
brew install go
echo "Go installed: $(go version)"
