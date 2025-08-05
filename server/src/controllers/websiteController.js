const Website = require('../models/Website');
const CrawledContent = require('../models/CrawledContent');
const { validationResult } = require('express-validator');

class WebsiteController {
  async createWebsite(req, res) {
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

      const { name, url, description, crawlDepth = 1 } = req.body;

      // Check if website already exists
      const existingWebsite = await Website.findOne({ url });
      if (existingWebsite) {
        return res.status(400).json({
          success: false,
          message: 'Website with this URL already exists'
        });
      }

      // Create website
      const website = new Website({
        name,
        url,
        description,
        crawlDepth
      });

      await website.save();

      res.status(201).json({
        success: true,
        message: 'Website created successfully',
        data: {
          website: {
            id: website._id,
            name: website.name,
            url: website.url,
            description: website.description,
            crawlStatus: website.crawlStatus,
            isActive: website.isActive,
            createdAt: website.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Create website error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create website',
        error: error.message
      });
    }
  }

  async getAllWebsites(req, res) {
    try {

      const { active, status, page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const filter = {};
      if (active !== undefined) {
        filter.isActive = active === 'true';
      }
      if (status) {
        filter.crawlStatus = status;
      }

      const websites = await Website.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Website.countDocuments(filter);

      // Get content count for each website
      const websitesWithStats = await Promise.all(
        websites.map(async (website) => {
          const contentCount = await CrawledContent.countDocuments({
            websiteId: website._id
          });

          return {
            id: website._id,
            name: website.name,
            url: website.url,
            description: website.description,
            crawlStatus: website.crawlStatus,
            isActive: website.isActive,
            lastCrawled: website.lastCrawled,
            totalPages: website.totalPages,
            contentCount,
            createdAt: website.createdAt,
            updatedAt: website.updatedAt
          };
        })
      );

      res.json({
        success: true,
        data: {
          websites: websitesWithStats,
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
      console.error('Get all websites error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get websites',
        error: error.message
      });
    }
  }

  async getWebsite(req, res) {
    try {
      const { id } = req.params;

      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Get crawled content stats
      const contentStats = await CrawledContent.aggregate([
        { $match: { websiteId: mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            totalWords: { $sum: '$wordCount' },
            totalImages: { $sum: { $size: '$images' } },
            totalLinks: { $sum: { $size: '$links' } }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          website: {
            id: website._id,
            name: website.name,
            url: website.url,
            description: website.description,
            crawlStatus: website.crawlStatus,
            isActive: website.isActive,
            lastCrawled: website.lastCrawled,
            totalPages: website.totalPages,
            crawlDepth: website.crawlDepth,
            createdAt: website.createdAt,
            updatedAt: website.updatedAt,
            stats: contentStats[0] || {
              totalContent: 0,
              totalWords: 0,
              totalImages: 0,
              totalLinks: 0
            }
          }
        }
      });

    } catch (error) {
      console.error('Get website error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get website',
        error: error.message
      });
    }
  }

  async updateWebsite(req, res) {
    try {
      const { id } = req.params;
      const { name, description, isActive, crawlDepth } = req.body;

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Update website
      const updatedWebsite = await Website.findByIdAndUpdate(
        id,
        {
          name: name || website.name,
          description: description || website.description,
          isActive: isActive !== undefined ? isActive : website.isActive,
          crawlDepth: crawlDepth || website.crawlDepth
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Website updated successfully',
        data: {
          website: {
            id: updatedWebsite._id,
            name: updatedWebsite.name,
            url: updatedWebsite.url,
            description: updatedWebsite.description,
            crawlStatus: updatedWebsite.crawlStatus,
            isActive: updatedWebsite.isActive,
            lastCrawled: updatedWebsite.lastCrawled,
            crawlDepth: updatedWebsite.crawlDepth,
            updatedAt: updatedWebsite.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Update website error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update website',
        error: error.message
      });
    }
  }

  async deleteWebsite(req, res) {
    try {
      const { id } = req.params;

      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Delete associated crawled content
      await CrawledContent.deleteMany({ websiteId: id });

      // Delete website
      await Website.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Website and associated content deleted successfully'
      });

    } catch (error) {
      console.error('Delete website error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete website',
        error: error.message
      });
    }
  }

  async getActiveWebsites(req, res) {
    try {
      const websites = await Website.find({ 
        isActive: true,
        crawlStatus: 'completed'
      })
        .select('name url description lastCrawled')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: {
          websites: websites.map(website => ({
            id: website._id,
            name: website.name,
            url: website.url,
            description: website.description,
            lastCrawled: website.lastCrawled
          }))
        }
      });

    } catch (error) {
      console.error('Get active websites error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active websites',
        error: error.message
      });
    }
  }
}

module.exports = new WebsiteController();