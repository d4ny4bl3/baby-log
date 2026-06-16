#!/bin/bash
set -e

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Pulling latest changes..."
git -C "$DEPLOY_DIR" pull

echo "==> Restarting backend..."
cd "$DEPLOY_DIR"
docker compose pull
docker compose up -d --build backend

echo "==> Done."
