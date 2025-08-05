import api from './api';

class ChatService {
  async sendMessage(userId, websiteId, question) {
    const response = await api.post('/chat/message', {
      userId,
      websiteId,
      question,
    });
    return response.data;
  }

  async getChatHistory(userId, websiteId = null, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (websiteId) {
      params.append('websiteId', websiteId);
    }

    const response = await api.get(`/chat/history/${userId}?${params}`);
    return response.data;
  }

  async getRecentChats(userId, limit = 10) {
    const response = await api.get(`/chat/recent/${userId}?limit=${limit}`);
    return response.data;
  }

  async getChatStats(userId) {
    const response = await api.get(`/chat/stats/${userId}`);
    return response.data;
  }

  async deleteChat(chatId, userId) {
    const response = await api.delete(`/chat/${chatId}`, {
      data: { userId }
    });
    return response.data;
  }
}

export default new ChatService();