// App imports
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";

// Define the type for User model
export interface User {
  id: number;
  username: string;
  email: string;
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

// Define the type for Login request
export interface LoginRequest {
  identifier: string; // Can be username, email, phone, or NIC
  password: string;
}

// Define the type for Login response
export interface LoginResponse {
  token: string;
  user: User;
}

// Define the type for Forgot Password request
export interface ForgotPasswordRequest {
  nic: string;
}

// Define the type for Reset Password request
export interface ResetPasswordRequest {
  nic: string;
  otp: string;
  new_password: string;
}

// Define the type for Change Password request
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Define the type for Register request
export interface RegisterRequest {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nic: string;
  password: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  status: State;
  loginState: State;
  registerState: State;
  forgotPasswordState: State;
  resetPasswordState: State;
  changePasswordState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  roles: string[];
  exp: number;
  iat: number;
  decodedIdToken: any;
}

// Define the initial state for the AuthSlice
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  status: State.idle,
  loginState: State.idle,
  registerState: State.idle,
  forgotPasswordState: State.idle,
  resetPasswordState: State.idle,
  changePasswordState: State.idle,
  stateMessage: "",
  errorMessage: "",
  roles: [],
  exp: 0,
  iat: 0,
  decodedIdToken: null,
};

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginRequest, { dispatch, rejectWithValue }) => {
    try {
      // Transform the identifier field to match backend expectations
      // The backend validation requires exactly one of: username, email, phone, or nic
      let transformedPayload: any = {
        password: payload.password,
      };

      // Determine the type of identifier and set ONLY that field
      if (payload.identifier.includes('@')) {
        // Email
        transformedPayload.email = payload.identifier;
      } else if (payload.identifier.length === 10 && /^\d+$/.test(payload.identifier)) {
        // Phone (10 digits)
        transformedPayload.phone = payload.identifier;
      } else if (payload.identifier.length === 12 && /^\d+$/.test(payload.identifier)) {
        // NIC (12 digits)
        transformedPayload.nic = payload.identifier;
      } else {
        // Username (anything else)
        transformedPayload.username = payload.identifier;
      }

      console.log('Frontend sending payload:', transformedPayload);

      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.auth.login,
        transformedPayload
      );

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.data.token);
        
        // Dispatch success message
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.login,
            type: "success",
          })
        );

        return response.data.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.auth.register,
        payload
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.register,
            type: "success",
          })
        );

        return response.data.data;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Forgot password (send OTP)
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: ForgotPasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.auth.forgotPassword,
        payload
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.otpSent,
            type: "success",
          })
        );

        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Reset password with OTP
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload: ResetPasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.auth.resetPassword,
        payload
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.passwordReset,
            type: "success",
          })
        );

        return response.data;
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Password reset failed";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload: ChangePasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.auth.changePassword,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.passwordChange,
            type: "success",
          })
        );

        return response.data;
      } else {
        throw new Error(response.data.message || "Password change failed");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Password change failed";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Check authentication token
export const checkAuthToken = createAsyncThunk(
  "auth/checkAuthToken",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.auth.verifyToken,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error("Token verification failed");
      }
    } catch (error: any) {
      // Clear invalid token
      localStorage.removeItem("token");
      return rejectWithValue("Token verification failed");
    }
  }
);

// Define the slice with reducers and extraReducers
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = [];
      state.exp = 0;
      state.iat = 0;
      state.decodedIdToken = null;
      state.status = State.idle;
    },
    clearMessages: (state) => {
      state.stateMessage = null;
      state.errorMessage = null;
    },
    resetStates: (state) => {
      state.loginState = State.idle;
      state.registerState = State.idle;
      state.forgotPasswordState = State.idle;
      state.resetPasswordState = State.idle;
      state.changePasswordState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loginState = State.loading;
        state.stateMessage = "Logging in...";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginState = State.success;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.stateMessage = "Login successful!";
        
        // Decode token and set roles
        try {
          const token = action.payload.token;
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          state.roles = decodedToken.roles || [];
          state.exp = decodedToken.exp || 0;
          state.iat = decodedToken.iat || 0;
          state.decodedIdToken = decodedToken;
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loginState = State.failed;
        state.errorMessage = action.payload as string || "Login failed";
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.registerState = State.loading;
        state.stateMessage = "Creating account...";
      })
      .addCase(register.fulfilled, (state) => {
        state.registerState = State.success;
        state.stateMessage = "Registration successful!";
      })
      .addCase(register.rejected, (state, action) => {
        state.registerState = State.failed;
        state.errorMessage = action.payload as string || "Registration failed";
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordState = State.loading;
        state.stateMessage = "Sending OTP...";
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordState = State.success;
        state.stateMessage = "OTP sent successfully!";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordState = State.failed;
        state.errorMessage = action.payload as string || "Failed to send OTP";
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordState = State.loading;
        state.stateMessage = "Resetting password...";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordState = State.success;
        state.stateMessage = "Password reset successful!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordState = State.failed;
        state.errorMessage = action.payload as string || "Password reset failed";
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.changePasswordState = State.loading;
        state.stateMessage = "Changing password...";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordState = State.success;
        state.stateMessage = "Password changed successfully!";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordState = State.failed;
        state.errorMessage = action.payload as string || "Password change failed";
      })
      
      // Check Auth Token
      .addCase(checkAuthToken.pending, (state) => {
        state.status = State.loading;
      })
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        state.status = State.success;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.user.roles || [];
      })
      .addCase(checkAuthToken.rejected, (state) => {
        state.status = State.failed;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.roles = [];
      });
  },
});

export const { logout, clearMessages, resetStates } = authSlice.actions;
export const selectUserInfo = (state: any) => state.auth.user;
export const selectRoles = (state: any) => state.auth.roles;
export default authSlice.reducer;
