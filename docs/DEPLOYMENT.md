# BZR Token Explorer - Deployment Guide

This guide provides step-by-step instructions for deploying the BZR Token Explorer (Backend & Frontend) to the production Ubuntu server.

## 1. Prerequisites

*   **Local Machine:**
    *   Node.js & npm installed.
    *   SSH access to the production server.
    *   `rsync` installed.
*   **Production Server:**
    *   Ubuntu 20.04/22.04 LTS.
    *   Node.js (v20+) & npm.
    *   PostgreSQL 14+.
    *   Nginx (serving the frontend).
    *   Systemd (managing the backend service).

---

## 2. Configuration (`.env`)

The deployment scripts rely on environment variables.

### Local Configuration
Create a `.env` file in the **root** of the repository on your local machine:

```bash
# Deployment Configuration
DEPLOY_HOST=159.198.70.88
DEPLOY_USER=root
```

### Server Configuration
Ensure the backend configuration exists on the server at `/var/www/bzr-backend/.env`:

```env
# Application Config
PORT=3001
NODE_ENV=production

# Database
TRANSFERS_DATABASE_URL=postgres://user:password@localhost:5432/bzr_transfers
TRANSFERS_DATA_SOURCE=store

# Admin Dashboard
ADMIN_PASSWORD=strong_admin_password_here
JWT_SECRET=super_secret_jwt_key_here

# API Keys (Fallback if DB is empty)
ETHERSCAN_V2_API_KEY=your_etherscan_key
CRONOS_API_KEY=your_cronos_key
```

---

## 3. Deployment

We have automated scripts to handle the heavy lifting.

### Step 1: Deploy Backend
This script syncs the code, installs dependencies, runs database migrations, and restarts the systemd service.

```bash
# Run from repository root
./scripts/deploy-backend.sh
```

**What this does:**
1.  Rsyncs `backend/` to `/var/www/bzr-backend`.
2.  SSH's into the server to run `npm install --production` and `npm run migrate`.
3.  Restarts `bzr-backend` and `bzr-ingester` services.

### Step 2: Deploy Frontend
This script builds the React application locally and uploads the optimized assets.

```bash
# Run from repository root
./scripts/deploy-frontend.sh
```

**What this does:**
1.  Runs `npm run build` in the `frontend` workspace.
2.  Rsyncs `frontend/dist/` to `/var/www/bzr-frontend`.
3.  (Nginx serves these files automatically; no restart needed unless config changed).

---

## 4. Verification

After deployment, verify everything is running smoothly.

### Check Backend Health
```bash
curl https://haswork.dev/api/health
# Expected output: {"status":"ok", ...}
```

### Check Logs (SSH into Server)
```bash
ssh root@159.198.70.88

# Backend Logs
journalctl -u bzr-backend -n 50 -f

# Ingester Logs (Blockchain Sync)
journalctl -u bzr-ingester -n 50 -f
```

### Verify Database Migration
If the Admin Dashboard isn't loading settings, check if the migration ran:
```bash
ssh root@159.198.70.88
# Connect to DB
sudo -u postgres psql -d bzr_transfers -c "SELECT * FROM settings;"
```

---

## 5. Troubleshooting / Manual Operations

### Manual Database Backup
The dashboard has a backup button, but you can also backup manually via SSH:
```bash
ssh root@159.198.70.88
pg_dump -d bzr_transfers --data-only --table=settings --table=transfer_events > backup_$(date +%F).sql
```

### Restart Services Manually
```bash
ssh root@159.198.70.88
systemctl restart bzr-backend
systemctl restart bzr-ingester
```

### Nginx Config (Frontend)
If the frontend returns 404s, check Nginx config at `/etc/nginx/sites-available/default` (or similar). It should try `$uri /index.html` for React routing.
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
