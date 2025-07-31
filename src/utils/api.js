import axios from 'axios';

// API base URL - use relative path for deployment
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API functions
export const chatAPI = {
  // Get all chats
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  // Create new chat
  createChat: async (title = 'New Plant Recognition') => {
    const response = await api.post('/chats', { title });
    return response.data;
  },

  // Get specific chat with messages
  getChat: async (chatId) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  // Update chat title
  updateChat: async (chatId, title) => {
    const response = await api.put(`/chats/${chatId}`, { title });
    return response.data;
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },

  // Add message to chat
  addMessage: async (chatId, message) => {
    const response = await api.post(`/chats/${chatId}/messages`, message);
    return response.data;
  },

  // Get messages for chat
  getMessages: async (chatId) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },
};

// Upload API functions
export const uploadAPI = {
  // Upload file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload base64 image
  uploadBase64: async (base64Data) => {
    const response = await api.post('/upload/base64', { image: base64Data });
    return response.data;
  },
};

// Plant recognition API functions
export const plantAPI = {
  // Identify plant from image URL
  identifyPlant: async (imageUrl, latitude = null, longitude = null) => {
    const response = await api.post('/plant/identify', {
      image_url: imageUrl,
      latitude,
      longitude,
    });
    return response.data;
  },

  // Get plant identification service status
  getStatus: async () => {
    const response = await api.get('/plant/identify/status');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || 'Server error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

export default api;

