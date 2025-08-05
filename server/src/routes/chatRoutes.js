const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Validation middleware
const sendMessageValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('websiteId')
    .isMongoId()
    .withMessage('Invalid website ID'),
  body('question')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters')
];

const deleteChatValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Routes
router.post('/message', sendMessageValidation, chatController.sendMessage);
router.get('/history/:userId', chatController.getChatHistory);
router.get('/recent/:userId', chatController.getRecentChats);
router.get('/stats/:userId', chatController.getChatStats);
router.delete('/:chatId', deleteChatValidation, chatController.deleteChat);

module.exports = router;