#!/bin/bash
set -e
echo "Installing MySQL..."
if command -v apt-get &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y mysql-server
  sudo systemctl enable --now mysql
elif command -v dnf &>/dev/null; then
  sudo dnf install -y mysql-server
  sudo systemctl enable --now mysqld
else
  echo "Unsupported package manager. Install MySQL manually from https://dev.mysql.com/downloads/"
  exit 1
fi
echo "MySQL installed: $(mysql --version)"
