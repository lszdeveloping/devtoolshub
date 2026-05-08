#!/usr/bin/env bash
set -e
brew install redis
brew services start redis
echo "Redis installed: $(redis-cli --version)"
