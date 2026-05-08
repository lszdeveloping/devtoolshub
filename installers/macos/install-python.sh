#!/usr/bin/env bash
set -e
echo "Installing Python..."
brew install python@3.12
echo "Python installed: $(python3 --version)"
