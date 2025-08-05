const mongoose = require('mongoose');

const crawledContentSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  links: [{
    type: String
  }],
  metadata: {
    description: String,
    keywords: [String],
    author: String
  },
  contentType: {
    type: String,
    default: 'text/html'
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better search performance
crawledContentSchema.index({ websiteId: 1 });
crawledContentSchema.index({ url: 1 });
crawledContentSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('CrawledContent', crawledContentSchema);