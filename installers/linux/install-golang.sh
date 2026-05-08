#!/usr/bin/env bash
set -e
GO_VER="1.22.3"
wget -q "https://go.dev/dl/go${GO_VER}.linux-amd64.tar.gz" -O /tmp/go.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf /tmp/go.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
export PATH=$PATH:/usr/local/go/bin
echo "Go installed: $(go version)"
