const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public login route
router.post('/login', adminController.adminLogin);

// Protected settings routes
router.get('/settings', requireAdmin, adminController.getSettings);
router.post('/settings', requireAdmin, adminController.updateSettings);

module.exports = router;
