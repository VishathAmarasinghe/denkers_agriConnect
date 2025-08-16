import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectIsAuthenticated, selectUserProfile } from '@/slice/authSlice/Auth';
import { AppDispatch, RootState } from '@/slice/store';
import { useEffect } from 'react';

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userProfile = useSelector(selectUserProfile);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      router.replace('/dashboard/tabs/home');
    }
  }, [isAuthenticated, userProfile]);

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Username, Email, Phone, or NIC is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(login({ identifier, password })).unwrap();
      // Navigation will be handled by useEffect when authentication state changes
    } catch (error) {
      console.error('Sign in failed:', error);
      // Error handling is done in the Redux slice
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign in
    console.log('Google sign in requested');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleForgotPassword = () => {
    router.push('/auth/resetPassword');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6">
            {/* Top Section with Logo and Welcome */}
            <View className="items-center pb-8 pt-8">
              <Image source={images.appLogo} className="mb-4 h-20 w-20" resizeMode="contain" />
              <Text className="text-center text-2xl font-bold text-gray-800">Welcome Back</Text>
            </View>

            {/* Form Section */}
            <View className="flex-1">
              <View className="mb-4">
                <TextInput
                  label="Username, Email, Phone, or NIC"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errors.identifier) setErrors({ ...errors, identifier: undefined });
                  }}
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="default"
                  error={!!errors.identifier}
                  disabled={isLoading}
                />
                {errors.identifier && (
                  <Text className="mt-1 text-sm text-red-500">{errors.identifier}</Text>
                )}
              </View>

              <View className="mb-4">
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  mode="outlined"
                  secureTextEntry
                  error={!!errors.password}
                  disabled={isLoading}
                />
                {errors.password && (
                  <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
                )}
              </View>

              {/* Forgot Password Link */}
              <View className="mb-6 items-end">
                <CustomButton
                  title="Forgot Password?"
                  onPress={handleForgotPassword}
                  variant="ghost"
                  size="small"
                  className="m-0 p-0"
                />
              </View>

              <View className="mb-6">
                <CustomButton 
                  title={isLoading ? "Signing In..." : "Sign In"} 
                  onPress={handleSignIn} 
                  variant="primary" 
                  size="large" 
                  fullWidth={true}
                  disabled={isLoading}
                />
              </View>

              {/* Sign Up Link */}
              <View className="mb-8 flex-row items-center justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <CustomButton
                  title="Sign Up"
                  onPress={handleSignUp}
                  variant="ghost"
                  size="medium"
                  className="m-0 p-0"
                  disabled={isLoading}
                />
              </View>

              {/* Divider with OR */}
              <View className="mb-8 flex-row items-center">
                <View className="h-px flex-1 bg-gray-300" />
                <Text className="mx-4 font-medium text-gray-500">OR</Text>
                <View className="h-px flex-1 bg-gray-300" />
              </View>

              {/* Google Sign In Button */}
              <View className="mb-8">
                <CustomButton
                  title="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="outline"
                  size="large"
                  fullWidth={true}
                  icon={
                    <MaterialIcons name="android" size={20} color="#4285F4" className="mr-2" />
                  }
                  disabled={isLoading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
