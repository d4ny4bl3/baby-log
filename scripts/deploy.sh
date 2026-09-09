#!/bin/bash
set -e

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Pulling latest changes..."
git -C "$DEPLOY_DIR" pull

echo "==> Restarting backend..."
cd "$DEPLOY_DIR"
GIT_COMMIT="$(git -C "$DEPLOY_DIR" rev-parse --short HEAD)"
export GIT_COMMIT
docker compose pull
docker compose up -d --build backend

echo "==> Done, deployed version $GIT_COMMIT."
