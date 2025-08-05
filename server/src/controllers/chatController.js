const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const Website = require('../models/Website');
const aiService = require('../services/aiService');
const { validationResult } = require('express-validator');

class ChatController {
  async sendMessage(req, res) {
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

      const { userId, websiteId, question } = req.body;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify website exists and is active
      const website = await Website.findById(websiteId);
      if (!website || !website.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Website not found or inactive'
        });
      }

      // Generate AI response
      const aiResponse = await aiService.generateResponse(question, websiteId, userId);

      // Save chat history
      const chatHistory = new ChatHistory({
        userId,
        websiteId,
        question,
        answer: aiResponse.answer,
        responseTime: aiResponse.responseTime,
        aiModel: aiResponse.aiModel || 'gemini-2.0-flash',
        relevanceScore: aiResponse.relevanceScore || 0
      });

      await chatHistory.save();

      // Update user's total queries
      await User.findByIdAndUpdate(userId, {
        $inc: { totalQueries: 1 },
        lastActiveAt: new Date()
      });

      res.json({
        success: true,
        data: {
          chatId: chatHistory._id,
          question: chatHistory.question,
          answer: chatHistory.answer,
          responseTime: chatHistory.responseTime,
          relevanceScore: chatHistory.relevanceScore,
          timestamp: chatHistory.createdAt
        }
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: error.message
      });
    }
  }

  async getChatHistory(req, res) {
    try {
      const { userId } = req.params;
      const { websiteId, page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const filter = { userId };
      if (websiteId) {
        filter.websiteId = websiteId;
      }

      const chatHistory = await ChatHistory.find(filter)
        .populate('websiteId', 'name url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ChatHistory.countDocuments(filter);

      res.json({
        success: true,
        data: {
          chats: chatHistory,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat history',
        error: error.message
      });
    }
  }

  async getRecentChats(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const recentChats = await ChatHistory.find({ userId })
        .populate('websiteId', 'name url')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('question answer websiteId createdAt responseTime relevanceScore');

      res.json({
        success: true,
        data: {
          recentChats
        }
      });

    } catch (error) {
      console.error('Get recent chats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent chats',
        error: error.message
      });
    }
  }

  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;

      const chat = await ChatHistory.findOne({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found or unauthorized'
        });
      }

      await ChatHistory.findByIdAndDelete(chatId);

      // Update user's total queries
      await User.findByIdAndUpdate(userId, {
        $inc: { totalQueries: -1 }
      });

      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });

    } catch (error) {
      console.error('Delete chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chat',
        error: error.message
      });
    }
  }

  async getChatStats(req, res) {
    try {
      const { userId } = req.params;

      const stats = await ChatHistory.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalChats: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevanceScore: { $avg: '$relevanceScore' },
            totalWordsAsked: { $sum: { $size: { $split: ['$question', ' '] } } },
            totalWordsAnswered: { $sum: { $size: { $split: ['$answer', ' '] } } }
          }
        }
      ]);

      const websiteStats = await ChatHistory.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$websiteId',
            count: { $sum: 1 },
            avgRelevance: { $avg: '$relevanceScore' }
          }
        },
        {
          $lookup: {
            from: 'websites',
            localField: '_id',
            foreignField: '_id',
            as: 'website'
          }
        },
        { $unwind: '$website' },
        {
          $project: {
            websiteName: '$website.name',
            websiteUrl: '$website.url',
            chatCount: '$count',
            avgRelevance: '$avgRelevance'
          }
        },
        { $sort: { chatCount: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overall: stats[0] || {
            totalChats: 0,
            avgResponseTime: 0,
            avgRelevanceScore: 0,
            totalWordsAsked: 0,
            totalWordsAnswered: 0
          },
          byWebsite: websiteStats
        }
      });

    } catch (error) {
      console.error('Get chat stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ChatController();