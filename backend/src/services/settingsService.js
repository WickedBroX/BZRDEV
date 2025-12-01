const persistentStore = require('../persistentStore');

// Cache settings in memory for short duration to reduce DB load
let settingsCache = {};
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

const getSettings = async () => {
  const now = Date.now();
  if (lastCacheTime && (now - lastCacheTime < CACHE_TTL_MS) && Object.keys(settingsCache).length > 0) {
    return settingsCache;
  }

  try {
    if (!persistentStore.isPersistentStoreReady()) {
        console.warn('SettingsService: Store not ready, returning empty/cache');
        return settingsCache; // Return stale cache or empty if store not ready
    }

    const result = await persistentStore.query('SELECT key, value FROM settings');

    const newSettings = {};
    if (result && result.rows) {
        result.rows.forEach(row => {
            newSettings[row.key] = row.value;
        });
    }

    settingsCache = newSettings;
    lastCacheTime = now;
    return newSettings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return settingsCache; // Fallback to cache on error
  }
};

const updateSetting = async (key, value) => {
  try {
    if (!persistentStore.isPersistentStoreReady()) {
        throw new Error('Database not ready');
    }

    await persistentStore.query(
      'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
      [key, JSON.stringify(value)]
    );

    // Update cache immediately
    settingsCache[key] = value;
    lastCacheTime = Date.now(); // Reset TTL

    return true;
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    throw error;
  }
};

const getApiKey = async (provider) => {
    const settings = await getSettings();
    const keys = settings.apiKeys || {};
    return keys[provider];
};

module.exports = {
  getSettings,
  updateSetting,
  getApiKey
};
