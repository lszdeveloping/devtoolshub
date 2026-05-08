#!/usr/bin/env bash
set -e
sudo apt-get update -qq
sudo apt-get install -y python3.12 python3.12-pip python3.12-venv
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.12 1
echo "Python installed: $(python --version)"
