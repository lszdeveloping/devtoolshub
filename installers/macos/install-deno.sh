#!/usr/bin/env bash
set -e
echo "Installing Deno..."
brew install deno
echo "Deno installed: $(deno --version | head -1)"
