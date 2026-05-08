#!/usr/bin/env bash
set -e
COMPOSE_VER="2.27.0"
sudo curl -SL "https://github.com/docker/compose/releases/download/v${COMPOSE_VER}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo "Docker Compose installed: $(docker compose version)"
