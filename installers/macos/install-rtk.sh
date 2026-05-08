#!/usr/bin/env bash
set -e
if command -v brew &>/dev/null; then
    brew install rtk
else
    curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
fi
echo "RTK installed"
