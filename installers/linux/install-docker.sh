#!/usr/bin/env bash
set -e
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
sudo systemctl enable docker
sudo systemctl start docker
echo "Docker installed: $(docker --version)"
echo "NOTE: Log out and back in for group changes to take effect."
