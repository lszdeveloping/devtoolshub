#!/bin/bash
set -e
echo "Installing MariaDB..."
if command -v brew &>/dev/null; then
  brew install mariadb
  brew services start mariadb
else
  echo "Homebrew not found. Install it first."
  exit 1
fi
echo "MariaDB installed: $(mariadb --version)"
