import axios, { AxiosInstance } from 'axios';

export class APIService {
  private static _instance: AxiosInstance;

  // Initialize the instance statically
  static initialize(baseURL: string = 'http://localhost:3000') {
    if (!APIService._instance) {
      APIService._instance = axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add request interceptor to include auth token
      APIService._instance.interceptors.request.use(
        async (config) => {
          // Get token from localStorage if available
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Add response interceptor for error handling
      APIService._instance.interceptors.response.use(
        (response) => {
          return response;
        },
        async (error) => {
          // Handle 401 errors (unauthorized)
          if (error.response?.status === 401) {
            // Redirect to login or clear token
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    }
  }

  // Get the shared axios instance
  public static getInstance(): AxiosInstance {
    if (!APIService._instance) {
      // Auto-initialize with default URL if not initialized
      APIService.initialize();
    }
    return APIService._instance;
  }

  // Method to update base URL
  public static updateBaseURL(baseURL: string) {
    if (APIService._instance) {
      APIService._instance.defaults.baseURL = baseURL;
    } else {
      APIService.initialize(baseURL);
    }
  }

  // HTTP GET method
  public static async get(url: string, config?: any) {
    const instance = APIService.getInstance();
    return instance.get(url, config);
  }

  // HTTP POST method
  public static async post(url: string, data?: any, config?: any) {
    const instance = APIService.getInstance();
    return instance.post(url, data, config);
  }

  // HTTP PUT method
  public static async put(url: string, data?: any, config?: any) {
    const instance = APIService.getInstance();
    return instance.put(url, data, config);
  }

  // HTTP DELETE method
  public static async delete(url: string, config?: any) {
    const instance = APIService.getInstance();
    return instance.delete(url, config);
  }

  // HTTP PATCH method
  public static async patch(url: string, data?: any, config?: any) {
    const instance = APIService.getInstance();
    return instance.patch(url, data, config);
  }
}
