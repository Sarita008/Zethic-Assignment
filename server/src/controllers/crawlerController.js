const crawlerService = require('../services/crawlerService');
const Website = require('../models/Website');
const { validationResult } = require('express-validator');

class CrawlerController {
  async crawlWebsite(req, res) {
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

      const { websiteId } = req.body;

      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      if (website.crawlStatus === 'crawling') {
        return res.status(400).json({
          success: false,
          message: 'Website is already being crawled'
        });
      }

      // Start crawling (this will run in background)
      crawlerService.crawlWebsite(websiteId)
        .then(result => {
          console.log('Crawling completed:', result);
        })
        .catch(error => {
          console.error('Crawling failed:', error);
        });

      res.json({
        success: true,
        message: 'Crawling started successfully',
        data: {
          websiteId,
          status: 'crawling'
        }
      });

    } catch (error) {
      console.error('Start crawl error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start crawling',
        error: error.message
      });
    }
  }

  async getCrawlStatus(req, res) {
    try {
      const { websiteId } = req.params;

      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      res.json({
        success: true,
        data: {
          websiteId,
          status: website.crawlStatus,
          lastCrawled: website.lastCrawled,
          totalPages: website.totalPages
        }
      });

    } catch (error) {
      console.error('Get crawl status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get crawl status',
        error: error.message
      });
    }
  }

  async recrawlWebsite(req, res) {
    try {
      const { websiteId } = req.params;

      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      if (website.crawlStatus === 'crawling') {
        return res.status(400).json({
          success: false,
          message: 'Website is already being crawled'
        });
      }

      // Delete existing content
      await CrawledContent.deleteMany({ websiteId });

      // Reset website status
      await Website.findByIdAndUpdate(websiteId, {
        crawlStatus: 'pending',
        totalPages: 0
      });

      // Start crawling
      crawlerService.crawlWebsite(websiteId)
        .then(result => {
          console.log('Re-crawling completed:', result);
        })
        .catch(error => {
          console.error('Re-crawling failed:', error);
        });

      res.json({
        success: true,
        message: 'Re-crawling started successfully',
        data: {
          websiteId,
          status: 'crawling'
        }
      });

    } catch (error) {
      console.error('Recrawl error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start re-crawling',
        error: error.message
      });
    }
  }

  async stopCrawling(req, res) {
    try {
      const { websiteId } = req.params;

      // Update status to failed (this is a simple implementation)
      // In a real application, you'd want to properly stop the crawling process
      await Website.findByIdAndUpdate(websiteId, {
        crawlStatus: 'failed'
      });

      res.json({
        success: true,
        message: 'Crawling stopped',
        data: {
          websiteId,
          status: 'failed'
        }
      });

    } catch (error) {
      console.error('Stop crawling error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop crawling',
        error: error.message
      });
    }
  }
}

module.exports = new CrawlerController();