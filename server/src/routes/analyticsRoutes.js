const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Routes
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/user/:userId', analyticsController.getUserAnalytics);
router.get('/website/:websiteId', analyticsController.getWebsiteAnalytics);
router.get('/health', analyticsController.getSystemHealth);

module.exports = router;