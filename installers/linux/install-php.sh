#!/bin/bash
set -e
echo "Installing PHP..."
if command -v apt-get &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y php php-cli php-common php-mbstring php-xml php-curl
elif command -v dnf &>/dev/null; then
  sudo dnf install -y php php-cli php-common
elif command -v pacman &>/dev/null; then
  sudo pacman -Sy --noconfirm php
else
  echo "Unsupported package manager."
  exit 1
fi
echo "PHP installed: $(php --version | head -1)"
