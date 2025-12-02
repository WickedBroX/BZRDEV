const settingsService = require('../services/settingsService');

const API_KEYS_RAW = process.env.ETHERSCAN_V2_API_KEY || '';
const DEFAULT_ETHERSCAN_API_KEYS = (() => {
  const keys = (API_KEYS_RAW.includes(',')
    ? API_KEYS_RAW.split(',').map((value) => value.trim())
    : [API_KEYS_RAW]).filter((value) => value.length > 0);
  return keys.length > 0 ? keys : [''];
})();

let currentKeyIndex = 0;

// Internal cache for DB keys to allow synchronous-like round-robin if needed,
// though getNextApiKey needs to be async now or we rely on the service's cache.
// For simplicity in refactoring without breaking all consumers immediately,
// we might need to keep this sync if consumers are sync.
// However, checking usage, 'getNextApiKey' is called in 'healthService' and 'chains.js'.

// WARNING: Refactoring to async might be breaking if callers expect sync.
// Let's check callers. 'healthService.fetchFinalizedBlockFromEtherscan' awaits axios, so it can await this.
// 'chains.js' -> 'buildProviderRequest' is synchronous. This is tricky.
// Strategy: The settingsService caches. We can expose a method to refresh the cache,
// but 'getNextApiKey' might need to stay sync for now and rely on a periodically updated variable
// OR we update 'chains.js' to be async (larger refactor).
//
// Hybrid Approach: We'll prioritize the Env vars first for safety, but if a DB key is present in our
// local cache (updated periodically), we use it.

let dynamicApiKeys = [];
let lastDynamicUpdate = 0;

const updateDynamicKeys = async () => {
  const now = Date.now();
  if (now - lastDynamicUpdate < 60000) return; // Throttle updates

  try {
    const dbKey = await settingsService.getApiKey('etherscan');
    if (dbKey && typeof dbKey === 'string' && dbKey.trim().length > 0) {
       dynamicApiKeys = dbKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } else {
       dynamicApiKeys = [];
    }
    lastDynamicUpdate = now;
  } catch (e) {
    console.warn('Failed to update dynamic API keys:', e.message);
  }
};

// Fire and forget update on load
updateDynamicKeys();

const getNextApiKey = () => {
  // Trigger an update check in background if stale (won't block this call)
  if (Date.now() - lastDynamicUpdate > 60000) {
      updateDynamicKeys().catch(err => console.error(err));
  }

  const keysToUse = dynamicApiKeys.length > 0 ? dynamicApiKeys : DEFAULT_ETHERSCAN_API_KEYS;

  if (keysToUse.length === 0) {
    return '';
  }

  const key = keysToUse[currentKeyIndex] || '';
  currentKeyIndex = (currentKeyIndex + 1) % keysToUse.length;
  return key;
};

const isProOnlyResponse = (payload = {}) => {
  const segments = [];
  if (typeof payload === 'string') {
    segments.push(payload);
  } else {
    if (payload?.message) segments.push(payload.message);
    if (payload?.result) segments.push(typeof payload.result === 'string' ? payload.result : JSON.stringify(payload.result));
  }

  const combined = segments.join(' ').toLowerCase();
  return combined.includes('pro') && (combined.includes('endpoint') || combined.includes('plan'));
};

module.exports = {
  getNextApiKey,
  isProOnlyResponse,
  ETHERSCAN_API_KEYS
};
