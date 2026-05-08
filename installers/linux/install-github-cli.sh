#!/usr/bin/env bash
set -e

echo "Installing GitHub CLI..."

if command -v apt-get >/dev/null 2>&1; then
  sudo mkdir -p -m 755 /etc/apt/keyrings
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  else
    echo "curl or wget is required to install GitHub CLI on apt-based systems."
    exit 1
  fi
  sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y gh
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y 'dnf-command(config-manager)'
  sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
  sudo dnf install -y gh
elif command -v yum >/dev/null 2>&1; then
  sudo yum install -y yum-utils
  sudo yum-config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
  sudo yum install -y gh
elif command -v brew >/dev/null 2>&1; then
  brew install gh
else
  echo "Unsupported Linux package manager. Install GitHub CLI manually from https://cli.github.com/"
  exit 1
fi

echo "GitHub CLI installed successfully"
gh --version
echo "Run 'gh auth login' to authenticate with GitHub."
