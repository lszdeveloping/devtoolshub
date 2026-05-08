#!/bin/bash
set -e
echo "Installing MariaDB..."
if command -v apt-get &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y mariadb-server
  sudo systemctl enable --now mariadb
elif command -v dnf &>/dev/null; then
  sudo dnf install -y mariadb-server
  sudo systemctl enable --now mariadb
elif command -v pacman &>/dev/null; then
  sudo pacman -Sy --noconfirm mariadb
  sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
  sudo systemctl enable --now mariadb
else
  echo "Unsupported package manager."
  exit 1
fi
echo "MariaDB installed: $(mariadb --version)"
