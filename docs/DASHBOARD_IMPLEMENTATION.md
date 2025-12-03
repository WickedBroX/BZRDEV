# Admin Dashboard Implementation Guide

This document describes the architecture and file structure of the **BZR Admin Dashboard**. Use this guide if you need to port the feature to another project or understand the components included in `dashboard-feature.zip`.

## 1. Feature Overview

The Admin Dashboard provides a secure web interface to manage:
*   **General Settings:** Logo, Token Address, Max Supply.
*   **Content:** Footer text.
*   **Social Links:** Dynamic list of social media links.
*   **API Keys:** Hot-swappable keys for Etherscan/Cronos (no restart required).
*   **Backups:** Streaming download of the database.

## 2. File Structure (Included in Zip)

### Backend (Node/Express)
*   `src/routes/admin.routes.js`: Defines `/api/admin/login`, `/settings`, `/backup`.
*   `src/controllers/adminController.js`: Handles request logic.
*   `src/services/settingsService.js`: Manages DB interactions (`settings` table) and caching.
*   `src/services/backupService.js`: Streams `pg_dump` output to the client.
*   `src/middleware/authMiddleware.js`: Protects routes using `ADMIN_PASSWORD` (env) and JWTs.
*   `migrations/`: SQL files to create the `settings` table.

### Frontend (React/Vite)
*   `src/pages/AdminPage.tsx`: The main dashboard UI with tabs.
*   `src/contexts/SettingsContext.tsx` & `SettingsProvider.tsx`: React Context to fetch settings on load and provide them globally.
*   *(Reference)* `MainLayout.tsx`: Shows how to consume `useSettings()` to display the dynamic Logo/Footer.

## 3. Installation Steps

If applying to a **new** repository:

1.  **Database Setup:**
    Run the SQL migrations found in `backend/migrations/`.
    ```bash
    psql -d your_db -f backend/migrations/002_create_settings_table.sql
    ```

2.  **Backend Integration:**
    *   Copy the backend files to your source tree.
    *   Install dependencies: `npm install jsonwebtoken`.
    *   Register the routes in your `server.js`:
        ```javascript
        const adminRoutes = require('./src/routes/admin.routes');
        app.use('/api/admin', adminRoutes);
        ```

3.  **Frontend Integration:**
    *   Copy `AdminPage.tsx` and `contexts/`.
    *   Wrap your App in `SettingsProvider` (in `main.tsx` or `App.tsx`):
        ```tsx
        <SettingsProvider>
          <App />
        </SettingsProvider>
        ```
    *   Add the route: `<Route path="admin" element={<AdminPage />} />`.

4.  **Configuration:**
    Add these to your `.env`:
    ```env
    ADMIN_PASSWORD=your_secure_password
    JWT_SECRET=your_random_secret
    ```
