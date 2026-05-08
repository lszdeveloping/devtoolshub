#!/bin/bash
set -e
echo "Installing MySQL Workbench..."
if command -v brew &>/dev/null; then
  brew install --cask mysqlworkbench
else
  echo "Homebrew not found. Install it first."
  exit 1
fi
echo "MySQL Workbench installed."
