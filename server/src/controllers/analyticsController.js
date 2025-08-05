const User = require('../models/User');
const Website = require('../models/Website');
const ChatHistory = require('../models/ChatHistory');
const CrawledContent = require('../models/CrawledContent');
const mongoose = require('mongoose');

class AnalyticsController {
  async getDashboardStats(req, res) {
    try {
      // Get basic counts
      const totalUsers = await User.countDocuments();
      const totalWebsites = await Website.countDocuments();
      const totalQueries = await ChatHistory.countDocuments();
      const activeWebsites = await Website.countDocuments({ isActive: true });

      // Get recent activity
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt totalQueries');

      const recentQueries = await ChatHistory.find()
        .populate('userId', 'name email')
        .populate('websiteId', 'name url')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('question answer userId websiteId createdAt responseTime');

      // Get query stats by day (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyQueries = await ChatHistory.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get top websites by query count
      const topWebsites = await ChatHistory.aggregate([
        {
          $group: {
            _id: '$websiteId',
            queryCount: { $sum: 1 },
            avgRelevance: { $avg: '$relevanceScore' },
            avgResponseTime: { $avg: '$responseTime' }
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
            name: '$website.name',
            url: '$website.url',
            queryCount: 1,
            avgRelevance: 1,
            avgResponseTime: 1
          }
        },
        { $sort: { queryCount: -1 } },
        { $limit: 5 }
      ]);

      // Get hourly distribution for today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const hourlyQueries = await ChatHistory.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart }
          }
        },
        {
          $group: {
            _id: {
              $hour: "$createdAt"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get user activity patterns
      const userActivityPatterns = await ChatHistory.aggregate([
        {
          $group: {
            _id: '$userId',
            totalQueries: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevance: { $avg: '$relevanceScore' },
            firstQuery: { $min: '$createdAt' },
            lastQuery: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userName: '$user.name',
            userEmail: '$user.email',
            totalQueries: 1,
            avgResponseTime: 1,
            avgRelevance: 1,
            daysSinceFirst: {
              $divide: [
                { $subtract: [new Date(), '$firstQuery'] },
                1000 * 60 * 60 * 24
              ]
            },
            queriesPerDay: {
              $divide: [
                '$totalQueries',
                {
                  $max: [
                    1,
                    {
                      $divide: [
                        { $subtract: [new Date(), '$firstQuery'] },
                        1000 * 60 * 60 * 24
                      ]
                    }
                  ]
                }
              ]
            }
          }
        },
        { $sort: { totalQueries: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalWebsites,
            totalQueries,
            activeWebsites
          },
          recentActivity: {
            users: recentUsers,
            queries: recentQueries
          },
          charts: {
            dailyQueries,
            hourlyQueries,
            topWebsites,
            userActivityPatterns
          }
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard statistics',
        error: error.message
      });
    }
  }

  async getUserAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // User's query history stats
      const queryStats = await ChatHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalQueries: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevanceScore: { $avg: '$relevanceScore' },
            totalWordsAsked: {
              $sum: { $size: { $split: ['$question', ' '] } }
            },
            totalWordsAnswered: {
              $sum: { $size: { $split: ['$answer', ' '] } }
            },
            bestRelevance: { $max: '$relevanceScore' },
            worstRelevance: { $min: '$relevanceScore' },
            fastestResponse: { $min: '$responseTime' },
            slowestResponse: { $max: '$responseTime' }
          }
        }
      ]);

      // Daily query distribution
      const dailyDistribution = await ChatHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevance: { $avg: '$relevanceScore' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Website usage stats
      const websiteUsage = await ChatHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$websiteId',
            count: { $sum: 1 },
            avgRelevance: { $avg: '$relevanceScore' },
            avgResponseTime: { $avg: '$responseTime' },
            totalWords: { $sum: { $size: { $split: ['$answer', ' '] } } }
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
            queryCount: '$count',
            avgRelevance: '$avgRelevance',
            avgResponseTime: '$avgResponseTime',
            totalWords: '$totalWords'
          }
        },
        { $sort: { queryCount: -1 } }
      ]);

      // Query patterns by hour
      const hourlyPatterns = await ChatHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $hour: "$createdAt"
            },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Most common question topics (simple keyword analysis)
      const questionTopics = await ChatHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $project: {
            words: { $split: [{ $toLower: '$question' }, ' '] }
          }
        },
        { $unwind: '$words' },
        {
          $match: {
            words: { 
              $nin: ['what', 'how', 'when', 'where', 'why', 'who', 'is', 'are', 'can', 'does', 'do', 'the', 'a', 'an', 'and', 'or', 'but']
            },
            'words': { $regex: /^[a-zA-Z]{3,}$/ }
          }
        },
        {
          $group: {
            _id: '$words',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        success: true,
        data: {
          overview: queryStats[0] || {
            totalQueries: 0,
            avgResponseTime: 0,
            avgRelevanceScore: 0,
            totalWordsAsked: 0,
            totalWordsAnswered: 0,
            bestRelevance: 0,
            worstRelevance: 0,
            fastestResponse: 0,
            slowestResponse: 0
          },
          dailyDistribution,
          websiteUsage,
          hourlyPatterns,
          questionTopics
        }
      });

    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user analytics',
        error: error.message
      });
    }
  }

  async getWebsiteAnalytics(req, res) {
    try {
      const { websiteId } = req.params;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Website query stats
      const queryStats = await ChatHistory.aggregate([
        {
          $match: {
            websiteId: new mongoose.Types.ObjectId(websiteId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalQueries: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevanceScore: { $avg: '$relevanceScore' },
            uniqueUsers: { $addToSet: '$userId' },
            bestRelevance: { $max: '$relevanceScore' },
            worstRelevance: { $min: '$relevanceScore' }
          }
        },
        {
          $project: {
            totalQueries: 1,
            avgResponseTime: 1,
            avgRelevanceScore: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            bestRelevance: 1,
            worstRelevance: 1
          }
        }
      ]);

      // Most common questions
      const commonQuestions = await ChatHistory.aggregate([
        {
          $match: {
            websiteId: new mongoose.Types.ObjectId(websiteId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$question',
            count: { $sum: 1 },
            avgRelevance: { $avg: '$relevanceScore' },
            avgResponseTime: { $avg: '$responseTime' },
            users: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            question: '$_id',
            count: 1,
            avgRelevance: 1,
            avgResponseTime: 1,
            uniqueUsers: { $size: '$users' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Daily usage trends
      const dailyTrends = await ChatHistory.aggregate([
        {
          $match: {
            websiteId: new mongoose.Types.ObjectId(websiteId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            queryCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevance: { $avg: '$relevanceScore' }
          }
        },
        {
          $project: {
            date: '$_id',
            queryCount: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            avgResponseTime: 1,
            avgRelevance: 1
          }
        },
        { $sort: { date: 1 } }
      ]);

      // User engagement patterns
      const userEngagement = await ChatHistory.aggregate([
        {
          $match: {
            websiteId: new mongoose.Types.ObjectId(websiteId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            queryCount: { $sum: 1 },
            avgRelevance: { $avg: '$relevanceScore' },
            firstQuery: { $min: '$createdAt' },
            lastQuery: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userName: '$user.name',
            userEmail: '$user.email',
            queryCount: 1,
            avgRelevance: 1,
            engagementSpan: {
              $divide: [
                { $subtract: ['$lastQuery', '$firstQuery'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        { $sort: { queryCount: -1 } },
        { $limit: 10 }
      ]);

      // Get website content stats
      const contentStats = await CrawledContent.aggregate([
        { $match: { websiteId: new mongoose.Types.ObjectId(websiteId) } },
        {
          $group: {
            _id: null,
            totalPages: { $sum: 1 },
            totalWords: { $sum: '$wordCount' },
            totalImages: { $sum: { $size: '$images' } },
            totalLinks: { $sum: { $size: '$links' } },
            avgWordsPerPage: { $avg: '$wordCount' },
            lastCrawled: { $max: '$createdAt' }
          }
        }
      ]);

      // Performance metrics over time
      const performanceMetrics = await ChatHistory.aggregate([
        {
          $match: {
            websiteId: new mongoose.Types.ObjectId(websiteId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevance: { $avg: '$relevanceScore' },
            queryCount: { $sum: 1 },
            maxResponseTime: { $max: '$responseTime' },
            minResponseTime: { $min: '$responseTime' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: queryStats[0] || {
            totalQueries: 0,
            avgResponseTime: 0,
            avgRelevanceScore: 0,
            uniqueUsers: 0,
            bestRelevance: 0,
            worstRelevance: 0
          },
          content: contentStats[0] || {
            totalPages: 0,
            totalWords: 0,
            totalImages: 0,
            totalLinks: 0,
            avgWordsPerPage: 0,
            lastCrawled: null
          },
          trends: {
            daily: dailyTrends,
            performance: performanceMetrics,
            commonQuestions,
            userEngagement
          }
        }
      });

    } catch (error) {
      console.error('Get website analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get website analytics',
        error: error.message
      });
    }
  }

  async getSystemHealth(req, res) {
    try {
      // Check database connection
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

      // Get system stats
      const stats = {
        database: {
          status: dbStatus,
          collections: {
            users: await User.countDocuments(),
            websites: await Website.countDocuments(),
            crawledContent: await CrawledContent.countDocuments(),
            chatHistory: await ChatHistory.countDocuments()
          }
        },
        crawling: {
          active: await Website.countDocuments({ crawlStatus: 'crawling' }),
          completed: await Website.countDocuments({ crawlStatus: 'completed' }),
          failed: await Website.countDocuments({ crawlStatus: 'failed' }),
          pending: await Website.countDocuments({ crawlStatus: 'pending' })
        },
        activity: {
          last24h: await ChatHistory.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }),
          last7days: await ChatHistory.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }),
          last30days: await ChatHistory.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          })
        },
        performance: {
          avgResponseTime: 0,
          avgRelevanceScore: 0
        }
      };

      // Get performance metrics
      const performanceStats = await ChatHistory.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            avgRelevanceScore: { $avg: '$relevanceScore' }
          }
        }
      ]);

      if (performanceStats.length > 0) {
        stats.performance = {
          avgResponseTime: Math.round(performanceStats[0].avgResponseTime || 0),
          avgRelevanceScore: parseFloat((performanceStats[0].avgRelevanceScore || 0).toFixed(3))
        };
      }

      // Check for any critical issues
      const criticalIssues = [];
      
      if (stats.crawling.failed > stats.crawling.completed) {
        criticalIssues.push('High crawling failure rate detected');
      }
      
      if (stats.performance.avgResponseTime > 10000) {
        criticalIssues.push('Response times are higher than normal');
      }
      
      if (stats.database.status !== 'connected') {
        criticalIssues.push('Database connection issues detected');
      }

      stats.criticalIssues = criticalIssues;
      stats.healthScore = criticalIssues.length === 0 ? 100 : Math.max(0, 100 - (criticalIssues.length * 25));

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system health',
        error: error.message
      });
    }
  }

  async getAdvancedAnalytics(req, res) {
    try {
      const { type, startDate, endDate } = req.query;
      
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      
      const matchStage = dateFilter.createdAt ? { createdAt: dateFilter } : {};

      let analytics = {};

      switch (type) {
        case 'user_behavior':
          analytics = await this.getUserBehaviorAnalytics(matchStage);
          break;
        case 'content_performance':
          analytics = await this.getContentPerformanceAnalytics(matchStage);
          break;
        case 'system_performance':
          analytics = await this.getSystemPerformanceAnalytics(matchStage);
          break;
        default:
          analytics = await this.getOverallAnalytics(matchStage);
      }

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get advanced analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get advanced analytics',
        error: error.message
      });
    }
  }

  async getUserBehaviorAnalytics(matchStage) {
    // Session duration analysis
    const sessionAnalysis = await ChatHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          queries: { $push: '$createdAt' },
          totalQueries: { $sum: 1 }
        }
      },
      {
        $project: {
          totalQueries: 1,
          sessionDuration: {
            $subtract: [
              { $max: '$queries' },
              { $min: '$queries' }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgSessionDuration: { $avg: '$sessionDuration' },
          avgQueriesPerSession: { $avg: '$totalQueries' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    return {
      sessionAnalysis: sessionAnalysis[0] || {}
    };
  }

  async getContentPerformanceAnalytics(matchStage) {
    // Content effectiveness analysis
    const contentPerformance = await ChatHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$websiteId',
          totalQueries: { $sum: 1 },
          avgRelevance: { $avg: '$relevanceScore' },
          avgResponseTime: { $avg: '$responseTime' }
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
        $lookup: {
          from: 'crawledcontents',
          localField: '_id',
          foreignField: 'websiteId',
          as: 'content'
        }
      },
      {
        $project: {
          websiteName: '$website.name',
          totalQueries: 1,
          avgRelevance: 1,
          avgResponseTime: 1,
          contentPages: { $size: '$content' },
          queriesPerPage: {
            $divide: ['$totalQueries', { $max: [1, { $size: '$content' }] }]
          }
        }
      },
      { $sort: { avgRelevance: -1 } }
    ]);

    return {
      contentPerformance
    };
  }

  async getSystemPerformanceAnalytics(matchStage) {
    // System load and performance metrics
    const performanceMetrics = await ChatHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H",
              date: "$createdAt"
            }
          },
          queryCount: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          minResponseTime: { $min: '$responseTime' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      performanceMetrics
    };
  }

  async getOverallAnalytics(matchStage) {
    const [userBehavior, contentPerformance, systemPerformance] = await Promise.all([
      this.getUserBehaviorAnalytics(matchStage),
      this.getContentPerformanceAnalytics(matchStage),
      this.getSystemPerformanceAnalytics(matchStage)
    ]);

    return {
      userBehavior,
      contentPerformance,
      systemPerformance
    };
  }
}

module.exports = new AnalyticsController();