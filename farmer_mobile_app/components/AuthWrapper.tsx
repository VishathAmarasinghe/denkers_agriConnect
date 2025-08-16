import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthToken, selectIsAuthenticated, selectUserProfile } from '@/slice/authSlice/Auth';
import { AppDispatch } from '@/slice/store';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { APIService } from '@/utils/apiService';
import { AuthService } from '@/utils/authService';
import { ServiceBaseUrl } from '@/config/config';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userProfile = useSelector(selectUserProfile);

  useEffect(() => {
    // Initialize both API and Auth services
    APIService.initialize(ServiceBaseUrl);
    AuthService.initialize();
    
    // Check for existing authentication token on app start
    const initializeAuth = async () => {
      try {
        // Dispatch the checkAuthToken thunk action
        await dispatch(checkAuthToken()).unwrap();
      } catch (error: any) {
        // Don't log "No token found" as an error - it's expected for new users
        if (error !== 'No token found') {
          console.error('Auth initialization failed:', error);
        }
        // Don't let auth errors crash the app
      }
    };

    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    // Handle navigation based on authentication state
    if (isAuthenticated && userProfile) {
      // User is authenticated, navigate to dashboard
      router.replace('/dashboard/tabs/home');
    } else if (isAuthenticated === false) {
      // User is not authenticated, navigate to auth
      router.replace('/auth/signIn');
    }
  }, [isAuthenticated, userProfile]);

  // Show loading while checking authentication
  if (isAuthenticated === undefined) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#52B788" />
      </View>
    );
  }

  return <>{children}</>;
}
