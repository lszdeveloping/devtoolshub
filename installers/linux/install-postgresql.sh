#!/usr/bin/env bash
set -e
sudo apt-get update -qq
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
echo "PostgreSQL installed: $(psql --version)"
