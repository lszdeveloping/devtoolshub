#!/bin/bash
set -e
echo "Installing PHP..."
if command -v brew &>/dev/null; then
  brew install php
else
  echo "Homebrew not found. Install it first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  exit 1
fi
echo "PHP installed: $(php --version | head -1)"
