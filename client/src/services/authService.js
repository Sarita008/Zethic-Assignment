import api from './api';

class AuthService {
  constructor() {
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response;
  }

  async register(userData, profileImage = null) {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  }

  async logout() {
    const response = await api.post('/auth/logout');
    return response;
  }

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response;
  }

  async updateProfile(userData, profileImage = null) {
    const formData = new FormData();
    
    if (userData.name) formData.append('name', userData.name);
    if (profileImage) formData.append('profileImage', profileImage);

    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  }

  async refreshToken() {
    const response = await api.post('/auth/refresh-token');
    return response;
  }
}

export default new AuthService();