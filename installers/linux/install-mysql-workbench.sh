#!/bin/bash
set -e
echo "Installing MySQL Workbench..."
if command -v apt-get &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y mysql-workbench
elif command -v dnf &>/dev/null; then
  sudo dnf install -y mysql-workbench-community
elif command -v snap &>/dev/null; then
  sudo snap install mysql-workbench-community
else
  echo "Unsupported package manager. Download from https://dev.mysql.com/downloads/workbench/"
  exit 1
fi
echo "MySQL Workbench installed."
