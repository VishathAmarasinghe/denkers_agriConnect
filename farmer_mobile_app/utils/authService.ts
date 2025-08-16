import { APIService } from './apiService';
import { ServiceBaseUrl, AppConfig } from '@/config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  identifier: string; // Can be username, email, phone, or NIC - backend supports all
  password: string;
}

export interface RegisterData {
  username: string;
  email?: string;
  phone: string;
  nic: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'farmer';
}

export interface GoogleAuthData {
  idToken: string;
  accessToken: string;
  user: {
    email: string;
    name: string;
    picture?: string;
  };
}

export interface ForgotPasswordData {
  nic: string;
}

export interface ResetPasswordData {
  nic: string;
  otp: string;
  new_password: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  phone: string;
  nic: string;
  role: string;
  first_name: string;
  last_name: string;
  location_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export class AuthService {
  /**
   * Initialize the API service with the backend URL
   */
  static initialize() {
    APIService.initialize(ServiceBaseUrl);
  }

  /**
   * User registration
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.register,
        data,
      });
      
      return APIService.handleResponse<AuthResponse>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  /**
   * User login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.login,
        data: credentials,
      });
      
      return APIService.handleResponse<AuthResponse>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  /**
   * Google authentication for existing users
   */
  static async googleAuth(data: GoogleAuthData): Promise<AuthResponse> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.googleAuth,
        data,
      });
      
      return APIService.handleResponse<AuthResponse>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Google authentication failed');
    }
  }

  /**
   * Google signup for new users
   */
  static async googleSignup(data: GoogleAuthData): Promise<AuthResponse> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.googleSignup,
        data,
      });
      
      return APIService.handleResponse<AuthResponse>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Google signup failed');
    }
  }

  /**
   * Request password reset OTP
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.forgotPassword,
        data,
      });
      
      return APIService.handleResponse<{ message: string }>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.resetPassword,
        data,
      });
      
      return APIService.handleResponse<{ message: string }>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Password reset failed');
    }
  }

  /**
   * Change password (authenticated)
   */
  static async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: AppConfig.apiEndpoints.changePassword,
        data,
      });
      
      return APIService.handleResponse<{ message: string }>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Password change failed');
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: AppConfig.apiEndpoints.profile,
      });
      
      return APIService.handleResponse<UserProfile>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await APIService.makeRequest({
        method: 'PUT',
        url: AppConfig.apiEndpoints.updateProfile,
        data,
      });
      
      return APIService.handleResponse<UserProfile>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Profile update failed');
    }
  }

  /**
   * Verify JWT token validity
   */
  static async verifyToken(): Promise<{ valid: boolean; user: any }> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: AppConfig.apiEndpoints.verifyToken,
      });
      
      return APIService.handleResponse<{ valid: boolean; user: any }>(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Token verification failed');
    }
  }

  /**
   * Logout (clear local storage)
   */
  static async logout(): Promise<void> {
    // Clear all stored authentication data
    await AsyncStorage.multiRemove([
      'token',
      'userId',
      'userInfo',
      'userProfile'
    ]);
  }
}
