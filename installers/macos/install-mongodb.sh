#!/usr/bin/env bash
set -e
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
echo "MongoDB installed"
