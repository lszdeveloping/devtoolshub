#!/bin/bash
set -e
echo "Installing xDebug..."
if command -v pecl &>/dev/null; then
  pecl install xdebug
elif command -v brew &>/dev/null; then
  brew install php  # ensures php + pecl available
  pecl install xdebug
else
  echo "pecl not found. Install PHP first."
  exit 1
fi
echo "xDebug installed."
