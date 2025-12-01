#!/bin/bash
set -e

# Check if .env exists in root and source it
if [ -f .env ]; then
  source .env
fi

if [ -z "$DEPLOY_HOST" ]; then
  echo "❌ Error: DEPLOY_HOST environment variable is not set."
  echo "Usage: DEPLOY_HOST=1.2.3.4 ./scripts/deploy-frontend.sh"
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-root}"
SERVER="$DEPLOY_USER@$DEPLOY_HOST"
REMOTE_PATH="/var/www/bzr-frontend"

echo "🚀 Starting Frontend Deployment to $SERVER..."

# 1. Build the frontend
echo "📦 Building frontend..."
# Ensure we are building the workspace frontend
npm run build --workspace=frontend

# 2. Deploy to server
echo "📤 Deploying to production..."
rsync -avz --delete ./frontend/dist/ $SERVER:$REMOTE_PATH/

echo "✅ Frontend deployment complete!"
