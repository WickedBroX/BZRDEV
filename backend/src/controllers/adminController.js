const settingsService = require('../services/settingsService');
const { login } = require('../middleware/authMiddleware');

const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
};

const updateSettings = async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ message: 'Key and value are required' });
  }

  try {
    await settingsService.updateSetting(key, value);
    res.json({ success: true, key, value });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update setting', error: error.message });
  }
};

const adminLogin = (req, res) => {
    return login(req, res);
};

module.exports = {
  getSettings,
  updateSettings,
  adminLogin
};
