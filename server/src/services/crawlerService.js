const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Website = require('../models/Website');
const CrawledContent = require('../models/CrawledContent');

class CrawlerService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true, // 'new' mode is unstable
        protocolTimeout: 90000,
        timeout: 90000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async crawlWebsite(websiteId) {
    let page = null;
    try {
      const website = await Website.findById(websiteId);
      if (!website) throw new Error('Website not found');

      await Website.findByIdAndUpdate(websiteId, {
        crawlStatus: 'crawling',
        lastCrawled: new Date()
      });

      const browser = await this.initBrowser();

      // Optional delay to let browser settle
      await new Promise(res => setTimeout(res, 1500));

      page = await browser.newPage();

      // Handle frame detach warnings
      page.on('framedetached', frame => {
        console.warn(`⚠️ Frame detached from ${frame.url()}`);
      });

      page.on('error', err => {
        console.warn('⚠️ Page error:', err.message);
      });

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      await page.setViewport({ width: 1366, height: 768 });

      try {
        await page.goto(website.url, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
      } catch (err) {
        throw new Error(`Failed to navigate to ${website.url}: ${err.message}`);
      }

      await page.waitForTimeout(2000); // Let dynamic content settle

      let content;
      try {
        content = await page.content();
      } catch (err) {
        throw new Error(`Failed to extract content: ${err.message}`);
      }

      const $ = cheerio.load(content);

      const extractedData = {
        websiteId: websiteId,
        url: website.url,
        title: $('title').text().trim() || 'No Title',
        content: this.extractTextContent($),
        images: this.extractImages($, website.url),
        links: this.extractLinks($, website.url),
        metadata: this.extractMetadata($),
        wordCount: 0
      };

      extractedData.wordCount = extractedData.content.split(/\s+/).length;

      const crawledContent = new CrawledContent(extractedData);
      await crawledContent.save();

      await Website.findByIdAndUpdate(websiteId, {
        crawlStatus: 'completed',
        totalPages: 1
      });

      return {
        success: true,
        contentId: crawledContent._id,
        wordCount: extractedData.wordCount
      };

    } catch (error) {
      console.error('Crawling error:', error.message);

      await Website.findByIdAndUpdate(websiteId, {
        crawlStatus: 'failed'
      });

      throw error;
    } finally {
      // Close page and browser always, and reset browser
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.warn('Failed to close page:', e.message);
        }
      }

      if (this.browser) {
        try {
          const pages = await this.browser.pages();
          await Promise.all(pages.map(p => p.close()));
          await this.browser.close();
        } catch (e) {
          console.warn('Failed to fully close browser:', e.message);
        }
        this.browser = null;
      }
    }
  }

  extractTextContent($) {
    $('script, style, nav, header, footer, aside').remove();
    let content = '';
    $('h1, h2, h3, h4, h5, h6, p, article, section, main').each((i, elem) => {
      content += $(elem).text().trim() + '\n';
    });
    if (!content.trim()) {
      content = $('body').text();
    }
    return content.replace(/\s+/g, ' ').trim();
  }

  extractImages($, baseUrl) {
    const images = [];
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        const imageUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push(imageUrl);
      }
    });
    return images.slice(0, 50);
  }

  extractLinks($, baseUrl) {
    const links = [];
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        const linkUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        links.push(linkUrl);
      }
    });
    return [...new Set(links)].slice(0, 100);
  }

  extractMetadata($) {
    return {
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [],
      author: $('meta[name="author"]').attr('content') || ''
    };
  }
}

module.exports = new CrawlerService();
