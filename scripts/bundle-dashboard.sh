#!/bin/bash
set -e

DIST_DIR="dashboard-feature"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

echo "📦 Bundling Admin Dashboard Feature..."

# --- Backend Files ---
echo "-> Copying Backend files..."
mkdir -p "$DIST_DIR/backend/src/controllers"
mkdir -p "$DIST_DIR/backend/src/routes"
mkdir -p "$DIST_DIR/backend/src/services"
mkdir -p "$DIST_DIR/backend/src/middleware"
mkdir -p "$DIST_DIR/backend/migrations"

cp backend/src/controllers/adminController.js "$DIST_DIR/backend/src/controllers/"
cp backend/src/routes/admin.routes.js "$DIST_DIR/backend/src/routes/"
cp backend/src/services/settingsService.js "$DIST_DIR/backend/src/services/"
cp backend/src/services/backupService.js "$DIST_DIR/backend/src/services/"
cp backend/src/middleware/authMiddleware.js "$DIST_DIR/backend/src/middleware/"
cp backend/migrations/002_create_settings_table.sql "$DIST_DIR/backend/migrations/"
cp backend/migrations/003_seed_content_settings.sql "$DIST_DIR/backend/migrations/"

# --- Frontend Files ---
echo "-> Copying Frontend files..."
mkdir -p "$DIST_DIR/frontend/src/pages"
mkdir -p "$DIST_DIR/frontend/src/contexts"
mkdir -p "$DIST_DIR/frontend/src/components"

cp frontend/src/pages/AdminPage.tsx "$DIST_DIR/frontend/src/pages/"
cp frontend/src/contexts/SettingsContext.tsx "$DIST_DIR/frontend/src/contexts/"
cp frontend/src/contexts/SettingsProvider.tsx "$DIST_DIR/frontend/src/contexts/"
# MainLayout and Header are existing files that were modified, we copy them for reference
cp frontend/src/layouts/MainLayout.tsx "$DIST_DIR/frontend/src/layouts_MainLayout_Ref.tsx"
cp frontend/src/components/TokenOverviewHeader.tsx "$DIST_DIR/frontend/src/components_TokenOverviewHeader_Ref.tsx"

# --- Config ---
echo "-> Copying Config..."
cp .env.example "$DIST_DIR/"

# --- Zip ---
echo "-> Zipping..."
zip -r dashboard-feature.zip "$DIST_DIR"

echo "✅ Done! Created dashboard-feature.zip"
