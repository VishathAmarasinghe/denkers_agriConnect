import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class APIService {
  private static _instance: AxiosInstance;

  // Initialize the instance statically to avoid re-initializing
  static initialize(baseURL: string) {
    if (!APIService._instance) {
      APIService._instance = axios.create({
        baseURL: baseURL,
        timeout: 15000, // Reduced timeout for mobile
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Add retry configuration
        validateStatus: (status) => {
          return status >= 200 && status < 500; // Accept all responses to handle errors properly
        },
      });

      // Add request interceptor to include auth token
      APIService._instance.interceptors.request.use(
        async (config) => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error getting token from storage:', error);
          }
          return config;
        },
        (error) => {
          console.error('Request interceptor error:', error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for token refresh and error handling
      APIService._instance.interceptors.response.use(
        (response: AxiosResponse) => {
          return response;
        },
        async (error) => {
          console.error('API Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            config: {
              url: error.config?.url,
              method: error.config?.method,
            }
          });

          if (error.response?.status === 401) {
            // Token expired or invalid, clear storage and redirect to login
            try {
              await AsyncStorage.multiRemove(['token', 'userId', 'userInfo', 'userProfile']);
            } catch (storageError) {
              console.error('Error clearing storage:', storageError);
            }
          }
          
          // Enhance error messages for better debugging
          if (error.code === 'ECONNABORTED') {
            error.message = 'Request timeout. Please check your internet connection.';
          } else if (error.code === 'ERR_NETWORK') {
            error.message = 'Network error. Please check your internet connection and try again.';
          } else if (!error.response) {
            error.message = 'Unable to connect to server. Please check your internet connection.';
          }
          
          return Promise.reject(error);
        }
      );
    }
  }

  // Get the shared axios instance
  public static getInstance(): AxiosInstance {
    if (!APIService._instance) {
      throw new Error('APIService not initialized. Call initialize() first.');
    }
    return APIService._instance;
  }

  // Helper method to make authenticated requests
  public static async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await APIService.getInstance().request(config);
      return response.data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Helper method to handle common API responses
  public static handleResponse<T>(response: any): T {
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'API request failed');
    }
  }

  // Test backend connectivity
  public static async testConnection(): Promise<boolean> {
    try {
      const response = await APIService.getInstance().get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      return false;
    }
  }
}
