#!/usr/bin/env bash
set -euo pipefail

# Orision Backend — Vultr Deployment
# Prerequisites:
#   1. Vultr Cloud Compute instance (Ubuntu 22.04+, 2GB+ RAM)
#   2. SSH access: ssh root@<VULTR_IP>
#   3. Docker + Docker Compose installed on instance
#
# Usage: ./deploy.sh <VULTR_IP>

VULTR_IP="${1:?Usage: ./deploy.sh <VULTR_IP>}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
REMOTE_DIR="/opt/orision"

echo "==> Deploying Orision backend to ${VULTR_IP}..."

# Sync backend code (exclude local artifacts)
echo "[1/4] Syncing code..."
rsync -avz --delete \
  --exclude='venv/' \
  --exclude='__pycache__/' \
  --exclude='.git/' \
  --exclude='*.pyc' \
  "$BACKEND_DIR/" "root@${VULTR_IP}:${REMOTE_DIR}/"

# Copy .env separately
echo "[2/4] Syncing .env..."
scp "$BACKEND_DIR/.env" "root@${VULTR_IP}:${REMOTE_DIR}/.env"

# Build and start
echo "[3/4] Building and starting containers..."
ssh "root@${VULTR_IP}" "cd ${REMOTE_DIR} && docker compose up -d --build"

# Verify
echo "[4/4] Verifying deployment..."
sleep 5
if curl -sf "http://${VULTR_IP}:8000/health" > /dev/null; then
  echo ""
  echo "==> Deployment successful!"
  echo "    FastAPI:  http://${VULTR_IP}:8000"
  echo "    MCP SSE:  http://${VULTR_IP}:8000/mcp/sse"
  echo "    Bureau:   http://${VULTR_IP}:8001"
  echo "    Health:   http://${VULTR_IP}:8000/health"
else
  echo "==> WARNING: Health check failed. Check logs with:"
  echo "    ssh root@${VULTR_IP} 'cd ${REMOTE_DIR} && docker compose logs'"
fi
