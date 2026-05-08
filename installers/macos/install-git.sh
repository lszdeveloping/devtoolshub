#!/usr/bin/env bash
set -e
echo "Installing Git..."
if command -v brew &>/dev/null; then brew install git
else xcode-select --install; fi
echo "Git installed: $(git --version)"
