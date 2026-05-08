#!/usr/bin/env bash
set -e
brew install git-lfs
git lfs install
echo "Git LFS installed: $(git lfs version)"
