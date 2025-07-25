import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  User,
  GiftData,
  BulkGiftData,
  GiftResponse,
  BulkGiftResponse,
  CampaignResponse,
  StatusUpdate,
  EmailConfig,
  EmailConfigResponse,
  CreateUserForm
} from '@/types';

// API Base URL
const API_BASE_URL = 'https://giftlib-backend.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
});

// Request interceptor to add API key
api.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('giftlib_api_key');
    if (apiKey && config.headers) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('⏰ Request timed out. The server may be overloaded or unresponsive.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('🔌 Connection failed. Please check if the backend server is running.');
    } else if (error.response?.status === 401) {
      toast.error('🔐 Unauthorized. Please check your API key.');
    } else if (error.response?.status === 403) {
      toast.error('🚫 Forbidden. You don\'t have permission to access this resource.');
    } else if (error.response?.status >= 500) {
      toast.error('🔥 Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Helper function to handle API errors
const handleError = (error: any): never => {
  if (error.response?.data?.detail) {
    throw new Error(error.response.data.detail);
  } else if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error('An unexpected error occurred');
  }
};

// API functions
export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // User management
  async createUser(userData: CreateUserForm): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('full_name', userData.full_name);
      if (userData.company_name) {
        formData.append('company_name', userData.company_name);
      }

      const response = await axios.post(`${API_BASE_URL}/api/users`, formData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const response = await api.get('/api/user/profile');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // Gift operations
  async initiateGift(giftData: GiftData): Promise<{ giftId: string }> {
    try {
      const response = await api.post('/api/initiate-gift', giftData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async bulkInitiateGifts(bulkData: BulkGiftData): Promise<BulkGiftResponse> {
    try {
      const response = await api.post('/api/bulk-initiate-gifts', bulkData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async getAllGifts(limit: number = 1000): Promise<{ success: boolean; gifts: GiftResponse[] }> {
    try {
      const response = await api.get('/api/gifts', { params: { limit } });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async getCampaignGifts(campaignId: string): Promise<CampaignResponse> {
    try {
      const response = await api.get(`/api/campaign-gifts/${campaignId}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async updateGiftStatus(statusData: StatusUpdate): Promise<any> {
    try {
      const response = await api.put('/api/gift-status', statusData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async getGiftStatus(giftId: string): Promise<{ status: string }> {
    try {
      const response = await api.get(`/api/gift-status/${giftId}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async verifyGift(giftId: string, verified: boolean): Promise<any> {
    try {
      const response = await api.post('/api/verify-gift', {
        giftId,
        verified
      });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // Excel operations
  async downloadExcelTemplate(): Promise<Blob> {
    try {
      const response = await api.get('/api/download-excel-template', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async uploadExcelFile(file: File, campaignId: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaign_id', campaignId);

      const response = await api.post('/api/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // Email configuration
  async getEmailConfig(): Promise<EmailConfigResponse> {
    try {
      const response = await api.get('/api/email-config');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async updateEmailConfig(config: EmailConfig): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('resend_api_key', config.resend_api_key);
      formData.append('from_email', config.from_email);
      if (config.sending_domain) {
        formData.append('sending_domain', config.sending_domain);
      }

      const response = await api.post('/api/email-config', formData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  async testEmailConfig(testData: any): Promise<any> {
    try {
      const formData = new FormData();
      Object.keys(testData).forEach(key => {
        if (testData[key] !== null && testData[key] !== undefined) {
          formData.append(key, testData[key]);
        }
      });

      const response = await api.post('/api/email-config/test', formData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // Utility functions
  setApiKey(apiKey: string) {
    localStorage.setItem('giftlib_api_key', apiKey);
  },

  getApiKey(): string | null {
    return localStorage.getItem('giftlib_api_key');
  },

  removeApiKey() {
    localStorage.removeItem('giftlib_api_key');
  }
};

export default apiService;