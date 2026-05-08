#!/usr/bin/env bash
set -e

echo "Installing GitHub CLI..."
brew install gh
echo "GitHub CLI installed successfully"
gh --version
echo "Run 'gh auth login' to authenticate with GitHub."
