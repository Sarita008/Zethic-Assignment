const User = require('../models/User');
const fileService = require('../services/fileService');
const { validationResult } = require('express-validator');

class UserController {
  async createUser(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, email } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Handle profile image upload
      let profileImage = null;
      if (req.file) {
        profileImage = await fileService.processAndSaveImage(
          req.file.buffer, 
          req.file.originalname
        );
      }

      // Create user
      const user = new User({
        name,
        email,
        profileImage: profileImage ? fileService.getFileUrl(profileImage) : null
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            totalQueries: user.totalQueries,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            totalQueries: user.totalQueries,
            lastActiveAt: user.lastActiveAt,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Handle profile image upload
      let profileImage = user.profileImage;
      if (req.file) {
        // Delete old image if exists
        if (user.profileImage) {
          const oldFileName = path.basename(user.profileImage);
          await fileService.deleteFile(oldFileName);
        }

        const newFileName = await fileService.processAndSaveImage(
          req.file.buffer, 
          req.file.originalname
        );
        profileImage = fileService.getFileUrl(newFileName);
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          name: name || user.name,
          email: email || user.email,
          profileImage,
          lastActiveAt: new Date()
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
            totalQueries: updatedUser.totalQueries,
            lastActiveAt: updatedUser.lastActiveAt,
            createdAt: updatedUser.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .select('name email profileImage totalQueries lastActiveAt createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments();

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  }

  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update last active
      await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            totalQueries: user.totalQueries,
            lastActiveAt: new Date(),
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Get user by email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();