import api from './api';

class WebsiteService {
  async createWebsite(websiteData) {
    const response = await api.post('/websites', websiteData);
    return response.data;
  }

  async getAllWebsites(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/websites?${params}`);
    return response.data;
  }

  async getActiveWebsites() {
    const response = await api.get('/websites/active');
    return response.data;
  }

  async getWebsiteById(websiteId) {
    const response = await api.get(`/websites/${websiteId}`);
    return response.data;
  }

  async updateWebsite(websiteId, updateData) {
    const response = await api.put(`/websites/${websiteId}`, updateData);
    return response.data;
  }

  async deleteWebsite(websiteId) {
    const response = await api.delete(`/websites/${websiteId}`);
    return response.data;
  }

  async crawlWebsite(websiteId) {
    const response = await api.post('/crawler/crawl', { websiteId });
    return response.data;
  }

  async getCrawlStatus(websiteId) {
    const response = await api.get(`/crawler/status/${websiteId}`);
    return response.data;
  }

  async recrawlWebsite(websiteId) {
    const response = await api.post(`/crawler/recrawl/${websiteId}`);
    return response.data;
  }
}

export default new WebsiteService();