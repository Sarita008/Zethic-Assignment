import api from './api';

class UserService {
  async createUser(userData, profileImage = null) {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const response = await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async getUserByEmail(email) {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  }

  async updateUser(userId, userData, profileImage = null) {
    const formData = new FormData();
    
    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (profileImage) formData.append('profileImage', profileImage);

    const response = await api.put(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async getAllUsers(page = 1, limit = 10) {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export default new UserService();