const express = require('express');
const { body } = require('express-validator');
const websiteController = require('../controllers/websiteController');

const router = express.Router();

// Validation middleware
const createWebsiteValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Website name must be between 1 and 200 characters'),
  body('url')
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('crawlDepth')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Crawl depth must be between 1 and 3')
];

const updateWebsiteValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Website name must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('crawlDepth')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Crawl depth must be between 1 and 3')
];

// Routes
router.post('/', createWebsiteValidation, websiteController.createWebsite);
router.get('/', websiteController.getAllWebsites);
router.get('/active', websiteController.getActiveWebsites);
router.get('/:id', websiteController.getWebsite);
router.put('/:id', updateWebsiteValidation, websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);

module.exports = router;