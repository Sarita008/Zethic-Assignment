const express = require('express');
const { body } = require('express-validator');
const crawlerController = require('../controllers/crawlerController');

const router = express.Router();

// Validation middleware
const crawlValidation = [
  body('websiteId')
    .isMongoId()
    .withMessage('Invalid website ID')
];

// Routes
router.post('/crawl', crawlValidation, crawlerController.crawlWebsite);
router.get('/status/:websiteId', crawlerController.getCrawlStatus);
router.post('/recrawl/:websiteId', crawlerController.recrawlWebsite);
router.post('/stop/:websiteId', crawlerController.stopCrawling);

module.exports = router;