const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    default: 0
  },
  aiModel: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
chatHistorySchema.index({ userId: 1, createdAt: -1 });
chatHistorySchema.index({ websiteId: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);