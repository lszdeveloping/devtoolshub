#!/usr/bin/env bash
set -e
curl -fsSL https://deno.land/install.sh | sh
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
echo "Deno installed: $(deno --version | head -1)"
