import { STORAGE_KEYS } from './constants';

class StorageManager {
  // User data management
  setUser(userData) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ID, userData.id);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  }

  getUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  getUserId() {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  }

  clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Website selection management
  setSelectedWebsite(websiteData) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_WEBSITE, JSON.stringify(websiteData));
      return true;
    } catch (error) {
      console.error('Error storing selected website:', error);
      return false;
    }
  }

  getSelectedWebsite() {
    try {
      const website = localStorage.getItem(STORAGE_KEYS.SELECTED_WEBSITE);
      return website ? JSON.parse(website) : null;
    } catch (error) {
      console.error('Error retrieving selected website:', error);
      return null;
    }
  }

  clearSelectedWebsite() {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_WEBSITE);
  }

  // Chat history caching
  setChatHistory(userId, websiteId, chatHistory) {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY}_${userId}_${websiteId}`;
      const data = {
        timestamp: Date.now(),
        data: chatHistory
      };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error storing chat history:', error);
      return false;
    }
  }

  getChatHistory(userId, websiteId, maxAge = 5 * 60 * 1000) { // 5 minutes
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY}_${userId}_${websiteId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;
      
      const { timestamp, data } = JSON.parse(stored);
      
      // Check if data is still fresh
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      return null;
    }
  }

  clearChatHistory(userId, websiteId) {
    if (userId && websiteId) {
      const key = `${STORAGE_KEYS.CHAT_HISTORY}_${userId}_${websiteId}`;
      localStorage.removeItem(key);
    } else {
      // Clear all chat history
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEYS.CHAT_HISTORY)) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // General cache management
  setCache(key, data, maxAge = 10 * 60 * 1000) { // 10 minutes default
    try {
      const cacheData = {
        timestamp: Date.now(),
        maxAge,
        data
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Error storing cache:', error);
      return false;
    }
  }

  getCache(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const { timestamp, maxAge, data } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error retrieving cache:', error);
      return null;
    }
  }

  clearCache(key = null) {
    if (key) {
      localStorage.removeItem(`cache_${key}`);
    } else {
      // Clear all cache
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith('cache_')) {
          localStorage.removeItem(storageKey);
        }
      });
    }
  }

  // Storage cleanup
  cleanup() {
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_') || key.startsWith(STORAGE_KEYS.CHAT_HISTORY)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.timestamp && data.maxAge) {
            if (now - data.timestamp > data.maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Get storage usage info
  getStorageInfo() {
    let totalSize = 0;
    let itemCount = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
        itemCount++;
      }
    }
    
    return {
      itemCount,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      available: this.getAvailableStorage()
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getAvailableStorage() {
    try {
      const testKey = '__storage_test__';
      const testValue = 'x';
      let currentSize = 0;
      
      // Estimate current usage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          currentSize += localStorage[key].length;
        }
      }
      
      // Try to find the limit
      try {
        while (true) {
          localStorage.setItem(testKey, testValue.repeat(currentSize));
          currentSize += testValue.length;
        }
      } catch (e) {
        localStorage.removeItem(testKey);
        return this.formatBytes(currentSize);
      }
    } catch (error) {
      return 'Unknown';
    }
  }
}

export default new StorageManager();