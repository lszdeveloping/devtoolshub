#!/usr/bin/env bash
set -e
sudo apt-get update -qq && sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
echo "Redis installed: $(redis-cli --version)"
