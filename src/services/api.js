import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }
};

// Events API
export const eventsAPI = {
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data.events;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  getEvent: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.event;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data.event;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },

  joinEvent: async (id) => {
    try {
      const response = await api.post(`/events/${id}/join`);
      // After joining, fetch updated event data
      const updatedEvent = await eventsAPI.getEvent(id);
      return updatedEvent;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join event');
    }
  },

  leaveEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}/leave`);
      // After leaving, fetch updated event data
      const updatedEvent = await eventsAPI.getEvent(id);
      return updatedEvent;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to leave event');
    }
  }
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  getCreatedEvents: async (params = {}) => {
    try {
      const response = await api.get('/users/events/created', { params });
      return response.data.events;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch created events');
    }
  },

  getJoinedEvents: async (params = {}) => {
    try {
      const response = await api.get('/users/events/joined', { params });
      return response.data.events;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch joined events');
    }
  }
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  },

  uploadImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload images');
    }
  },

  deleteFile: async (filename) => {
    try {
      const response = await api.delete(`/upload/${filename}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('API health check failed');
    }
  }
};

export default api;