const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const fileService = require('../services/fileService');

const router = express.Router();
const upload = fileService.getMulterConfig();

// Validation middleware
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Routes
router.post('/', upload.single('profileImage'), createUserValidation, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.get('/email/:email', userController.getUserByEmail);
router.put('/:id', upload.single('profileImage'), updateUserValidation, userController.updateUser);

module.exports = router;