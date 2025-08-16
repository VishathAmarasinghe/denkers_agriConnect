import { AppConfig, APPLICATION_ADMIN, APPLICATION_FARMER } from '@/config/config';
import { SnackMessage } from '@/config/constant';
import { State } from '@/types/types';
import { AuthService, LoginCredentials, RegisterData, UserProfile } from '@/utils/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { showSnackbar } from '../snackbarSlice/snackbarSlice';
import { AppDispatch, RootState } from '../store';

export interface UserData {
  userEmail: string;
  userID: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  status: State;
  passwordResetState: State;
  mode: 'active' | 'inactive' | 'locked' | 'maintenance';
  statusMessage: string | null;
  userInfo: UserData | null;
  userProfile: UserProfile | null;
  decodedIdToken: any;
  roles: string[];
  exp: number;
  iat: number;
}

const initialState: AuthState = {
  isAuthenticated: false,
  status: State.idle,
  mode: 'active',
  passwordResetState: State.idle,
  statusMessage: null,
  userInfo: null,
  userProfile: null,
  decodedIdToken: null,
  roles: [],
  exp: 0,
  iat: 0,
};

export const login = createAsyncThunk(
  'login/user',
  async (payload: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      console.log('Login attempt with:', payload);
      
      const authResponse = await AuthService.login(payload);
      
      // Store token and user data
      await AsyncStorage.setItem('token', authResponse.token);
      await AsyncStorage.setItem('userId', authResponse.user.id.toString());
      await AsyncStorage.setItem('userProfile', JSON.stringify(authResponse.user));
      
      dispatch(showSnackbar({ message: 'Login Successful', type: 'success' }));
      
      return authResponse;
    } catch (error: any) {
      console.error('Login error:', error);
      
      dispatch(
        showSnackbar({
          message: error.message || 'Login failed. Please try again.',
          type: 'error',
        })
      );
      
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterData, { dispatch, rejectWithValue }) => {
    try {
      console.log('Registration attempt with:', payload);
      
      const authResponse = await AuthService.register(payload);
      
      // Store token and user data
      await AsyncStorage.setItem('token', authResponse.token);
      await AsyncStorage.setItem('userId', authResponse.user.id.toString());
      await AsyncStorage.setItem('userProfile', JSON.stringify(authResponse.user));
      
      dispatch(showSnackbar({ message: 'Registration Successful', type: 'success' }));
      
      return authResponse;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      dispatch(
        showSnackbar({
          message: error.message || 'Registration failed. Please try again.',
          type: 'error',
        })
      );
      
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { nic: string }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Forgot password attempt for NIC:', payload.nic);
      
      const response = await AuthService.forgotPassword(payload);
      
      dispatch(
        showSnackbar({
          message: response.message || 'OTP sent successfully',
          type: 'success',
        })
      );
      
      return response;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to send OTP. Please try again.',
          type: 'error',
        })
      );
      
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload: { nic: string; otp: string; new_password: string }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Reset password attempt for NIC:', payload.nic);
      
      const response = await AuthService.resetPassword(payload);
      
      dispatch(
        showSnackbar({
          message: response.message || 'Password reset successfully',
          type: 'success',
        })
      );
      
      return response;
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      dispatch(
        showSnackbar({
          message: error.message || 'Password reset failed. Please try again.',
          type: 'error',
        })
      );
      
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: { current_password: string; new_password: string }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Change password attempt');
      
      const response = await AuthService.changePassword(payload);
      
      dispatch(
        showSnackbar({
          message: response.message || 'Password changed successfully',
          type: 'success',
        })
      );
      
      return response;
    } catch (error: any) {
      console.error('Change password error:', error);
      
      dispatch(
        showSnackbar({
          message: error.message || 'Password change failed. Please try again.',
          type: 'error',
        })
      );
      
      return rejectWithValue(error.message);
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const profile = await AuthService.getProfile();
      return profile;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: Partial<UserProfile>, { dispatch, rejectWithValue }) => {
    try {
      const profile = await AuthService.updateProfile(payload);
      
      dispatch(
        showSnackbar({
          message: 'Profile updated successfully',
          type: 'success',
        })
      );
      
      return profile;
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      dispatch(
        showSnackbar({
          message: error.message || 'Profile update failed. Please try again.',
          type: 'error',
        })
      );
      
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthToken = createAsyncThunk(
  'auth/checkAuthToken',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // No token found - this is normal for new users, don't dispatch logout
        return rejectWithValue('No token found');
      }

      // Verify token with backend
      const tokenVerification = await AuthService.verifyToken();
      
      if (tokenVerification.valid) {
        const decodedToken: any = jwtDecode(token);
        const currentTime = new Date().getTime() / 1000;

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          // Token is valid, get user profile
          const profile = await AuthService.getProfile();
          
          // Determine user roles based on backend role
          const userRoles: string[] = [];
          if (profile.role === 'farmer') {
            userRoles.push(APPLICATION_FARMER);
          }
          if (profile.role === 'admin') {
            userRoles.push(APPLICATION_ADMIN);
          }

          // Return the data to be handled by the reducer
          return {
            userInfo: {
              userEmail: profile.email || '',
              userID: profile.id.toString(),
            },
            userProfile: profile,
            roles: userRoles,
            exp: decodedToken.exp,
            iat: decodedToken.iat,
          };
        } else {
          // Token expired - clear storage and reject
          await AsyncStorage.multiRemove(['token', 'userId', 'userProfile']);
          return rejectWithValue('Token expired');
        }
      } else {
        // Token invalid - clear storage and reject
        await AsyncStorage.multiRemove(['token', 'userId', 'userProfile']);
        return rejectWithValue('Invalid token');
      }
    } catch (error: any) {
      console.error('Error checking auth token:', error);
      // Only clear storage if there was a real error, not just "no token"
      if (error.message !== 'No token found') {
        await AsyncStorage.multiRemove(['token', 'userId', 'userProfile']);
      }
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

const storeData = async ({ key, value }: { key: string; value: string }) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('Error saving data', e);
  }
};

const getDataFromStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error('Error getting data', e);
  }
};

const removeDateFromStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing data', e);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<Partial<AuthState>>) => {
      state.isAuthenticated = true;
      state.userInfo = {
        userEmail: action.payload.userInfo?.userEmail || '',
        userID: action.payload.userInfo?.userID || '',
      };
      state.userProfile = action.payload.userProfile || null;
      state.roles = action.payload.roles || [];
      state.exp = action.payload.exp || 0;
      state.iat = action.payload.iat || 0;
      state.status = State.success;
    },
    logout: state => {
      // Clear storage and reset state
      removeDateFromStorage('token');
      removeDateFromStorage('userId');
      removeDateFromStorage('userProfile');
      
      state.isAuthenticated = false;
      state.status = State.idle;
      state.mode = 'inactive';
      state.statusMessage = null;
      state.userInfo = null;
      state.userProfile = null;
      state.decodedIdToken = null;
      state.roles = [];
      state.exp = 0;
      state.iat = 0;
    },
    resetPasswordState: state => {
      state.passwordResetState = State.idle;
      state.statusMessage = null;
    },
    clearStatus: state => {
      state.status = State.idle;
      state.statusMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      // Login cases
      .addCase(login.pending, state => {
        state.status = State.loading;
        state.statusMessage = 'Signing in...';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = State.success;
        state.statusMessage = 'Successfully signed in!';
        state.isAuthenticated = true;
        state.mode = 'active';
        state.userInfo = {
          userEmail: action.payload.user.email || '',
          userID: action.payload.user.id.toString(),
        };
        state.userProfile = action.payload.user;
        state.roles = [APPLICATION_FARMER]; // Default to farmer role
        state.exp = 0; // Will be set from token decode
        state.iat = 0;
      })
      .addCase(login.rejected, state => {
        state.status = State.failed;
        state.statusMessage = 'Failed to sign in!';
        state.isAuthenticated = false;
        state.userInfo = null;
        state.userProfile = null;
        state.roles = [];
        state.exp = 0;
        state.iat = 0;
      })
      // Registration cases
      .addCase(register.pending, state => {
        state.status = State.loading;
        state.statusMessage = 'Creating account...';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = State.success;
        state.statusMessage = 'Account created successfully!';
        state.isAuthenticated = true;
        state.mode = 'active';
        state.userInfo = {
          userEmail: action.payload.user.email || '',
          userID: action.payload.user.id.toString(),
        };
        state.userProfile = action.payload.user;
        state.roles = [APPLICATION_FARMER];
        state.exp = 0;
        state.iat = 0;
      })
      .addCase(register.rejected, state => {
        state.status = State.failed;
        state.statusMessage = 'Failed to create account!';
        state.isAuthenticated = false;
        state.userInfo = null;
        state.userProfile = null;
        state.roles = [];
        state.exp = 0;
        state.iat = 0;
      })
      // Forgot password cases
      .addCase(forgotPassword.pending, state => {
        state.passwordResetState = State.loading;
        state.statusMessage = 'Sending OTP...';
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.passwordResetState = State.success;
        state.statusMessage = 'OTP sent successfully!';
      })
      .addCase(forgotPassword.rejected, state => {
        state.passwordResetState = State.failed;
        state.statusMessage = 'Failed to send OTP!';
      })
      // Reset password cases
      .addCase(resetPassword.pending, state => {
        state.passwordResetState = State.loading;
        state.statusMessage = 'Resetting password...';
      })
      .addCase(resetPassword.fulfilled, state => {
        state.passwordResetState = State.success;
        state.statusMessage = 'Password reset successfully!';
      })
      .addCase(resetPassword.rejected, state => {
        state.passwordResetState = State.failed;
        state.statusMessage = 'Failed to reset password!';
      })
      // Change password cases
      .addCase(changePassword.pending, state => {
        state.status = State.loading;
        state.statusMessage = 'Changing password...';
      })
      .addCase(changePassword.fulfilled, state => {
        state.status = State.success;
        state.statusMessage = 'Password changed successfully!';
      })
      .addCase(changePassword.rejected, state => {
        state.status = State.failed;
        state.statusMessage = 'Failed to change password!';
      })
      // Profile cases
      .addCase(getProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
        state.userInfo = {
          userEmail: action.payload.email || '',
          userID: action.payload.id.toString(),
        };
      })
      // Check auth token cases
      .addCase(checkAuthToken.pending, state => {
        state.status = State.loading;
        state.statusMessage = 'Checking authentication...';
      })
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        state.status = State.success;
        state.statusMessage = 'Authentication verified!';
        state.isAuthenticated = true;
        state.mode = 'active';
        state.userInfo = action.payload.userInfo;
        state.userProfile = action.payload.userProfile;
        state.roles = action.payload.roles;
        state.exp = action.payload.exp;
        state.iat = action.payload.iat;
      })
      .addCase(checkAuthToken.rejected, state => {
        state.status = State.failed;
        state.statusMessage = 'Authentication failed!';
        state.isAuthenticated = false;
        state.userInfo = null;
        state.userProfile = null;
        state.roles = [];
        state.exp = 0;
        state.iat = 0;
      });
  },
});

export const { logout, resetPasswordState, clearStatus } = authSlice.actions;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const selectUserProfile = (state: RootState) => state.auth.userProfile;
export const selectRoles = (state: RootState) => state.auth.roles;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export default authSlice.reducer;
