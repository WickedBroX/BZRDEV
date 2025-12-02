#!/bin/bash
set -e

# Check if .env exists in root and source it for deploy variables if needed
if [ -f .env ]; then
  source .env
fi

if [ -z "$DEPLOY_HOST" ]; then
  echo "❌ Error: DEPLOY_HOST environment variable is not set."
  echo "Usage: DEPLOY_HOST=1.2.3.4 ./scripts/deploy-backend.sh"
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-root}"
SERVER="$DEPLOY_USER@$DEPLOY_HOST"
BACKEND_PATH="/var/www/bzr-backend"
LOCAL_BACKEND="./backend"
SYSTEMD_DIR="$LOCAL_BACKEND/deploy/systemd"

echo "🚀 Deploying BZR Backend to $SERVER..."
echo "================================================"

# Step 1: Sync backend files
echo ""
echo "📦 Step 1: Uploading backend files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  $LOCAL_BACKEND/ $SERVER:$BACKEND_PATH/

echo "✅ Backend files uploaded"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
ssh $SERVER <<ENDSSH
cd $BACKEND_PATH

export PATH="/usr/local/bin:/usr/bin:\$PATH"
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"

echo "Node version: \$(node --version 2>/dev/null || echo 'Node not found in PATH')"

echo "Installing npm packages..."
npm install --production

echo "Running database migrations..."
npm run migrate

chmod +x scripts/start-backend.sh scripts/start-ingester.sh 2>/dev/null || true
ENDSSH

# Step 3: Install/Update Systemd Services
echo ""
echo "⚙️  Step 3: Installing systemd service units..."
scp "$SYSTEMD_DIR/bzr-backend.service" "$SERVER:/etc/systemd/system/bzr-backend.service"
scp "$SYSTEMD_DIR/bzr-ingester.service" "$SERVER:/etc/systemd/system/bzr-ingester.service"

# Step 4: Restart Services
echo ""
echo "🚀 Step 4: Restarting services..."
ssh $SERVER <<ENDSSH
set -e
systemctl daemon-reload
systemctl enable bzr-backend.service
systemctl enable bzr-ingester.service
systemctl restart bzr-backend.service
systemctl restart bzr-ingester.service
sleep 2
systemctl --no-pager status bzr-backend.service | head -n 20
ENDSSH

echo ""
echo "================================================"
echo "✅ Backend deployment complete!"
