#!/usr/bin/env bash
set -e
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install -y git-lfs
git lfs install
echo "Git LFS installed: $(git lfs version)"
