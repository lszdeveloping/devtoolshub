#!/bin/bash
set -e
echo "Installing xDebug..."
if command -v apt-get &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y php-xdebug
elif command -v dnf &>/dev/null; then
  sudo dnf install -y php-xdebug
elif command -v pecl &>/dev/null; then
  pecl install xdebug
else
  echo "Unsupported package manager. Install xDebug via PECL: pecl install xdebug"
  exit 1
fi
echo "xDebug installed."
