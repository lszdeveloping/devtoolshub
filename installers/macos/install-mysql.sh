#!/bin/bash
set -e
echo "Installing MySQL..."
if command -v brew &>/dev/null; then
  brew install mysql
  brew services start mysql
else
  echo "Homebrew not found. Install it first."
  exit 1
fi
echo "MySQL installed: $(mysql --version)"
