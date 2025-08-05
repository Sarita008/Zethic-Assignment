import api from './api';

class AnalyticsService {
  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }

  async getUserAnalytics(userId, days = 30) {
    const response = await api.get(`/analytics/user/${userId}?days=${days}`);
    return response.data;
  }

  async getWebsiteAnalytics(websiteId, days = 30) {
    const response = await api.get(`/analytics/website/${websiteId}?days=${days}`);
    return response.data;
  }

  async getSystemHealth() {
    const response = await api.get('/analytics/health');
    return response.data;
  }
}

export default new AnalyticsService();