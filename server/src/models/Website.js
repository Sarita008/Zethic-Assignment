const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  lastCrawled: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  crawlStatus: {
    type: String,
    enum: ['pending', 'crawling', 'completed', 'failed'],
    default: 'pending'
  },
  totalPages: {
    type: Number,
    default: 0
  },
  crawlDepth: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

websiteSchema.index({ url: 1 });
websiteSchema.index({ isActive: 1 });

module.exports = mongoose.model('Website', websiteSchema);