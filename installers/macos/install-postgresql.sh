#!/usr/bin/env bash
set -e
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
echo "PostgreSQL installed: $(psql --version)"
