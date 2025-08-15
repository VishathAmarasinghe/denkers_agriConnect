import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectIsAuthenticated, selectUserProfile } from '@/slice/authSlice/Auth';
import { AppDispatch } from '@/slice/store';
import { useEffect } from 'react';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    nic?: string;
    phoneNo?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().split(' ').length < 2) {
      newErrors.name = 'Please enter your full name (first and last name)';
    }

    if (!nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (nic.trim().length !== 12) {
      newErrors.nic = 'NIC must be 12 characters long';
    }

    if (!phoneNo.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNo.trim())) {
      newErrors.phoneNo = 'Phone number must be 10 digits';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const registerData = {
        username: phoneNo.trim(), // Use phone as username
        email: email.trim() || undefined,
        phone: phoneNo.trim(),
        nic: nic.trim(),
        password: password,
        first_name: firstName,
        last_name: lastName,
        role: 'farmer' as const,
      };

      await dispatch(register(registerData)).unwrap();
      // Navigation will be handled by useEffect when authentication state changes
    } catch (error) {
      console.error('Signup failed:', error);
      // Error handling is done in the Redux slice
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google signup
    console.log('Google signup requested');
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
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
            <View className="items-center pb-6 pt-8">
              <Image source={images.appLogo} className="mb-4 h-20 w-20" resizeMode="contain" />
              <Text className="mb-4 text-center text-2xl font-bold text-gray-800">Create your account</Text>
              <Text className="px-4 text-center text-sm leading-5 text-gray-600">
                Please note that phone verification is required for signup. Your number will only be used to verify your
                identity for security purposes.
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1">
              <View className="mb-4">
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError('name');
                  }}
                  mode="outlined"
                  autoCapitalize="words"
                  keyboardType="default"
                  error={!!errors.name}
                  disabled={isLoading}
                />
                {errors.name && (
                  <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
                )}
              </View>

              <View className="mb-4">
                <TextInput
                  label="NIC (12 digits)"
                  value={nic}
                  onChangeText={(text) => {
                    setNic(text);
                    clearError('nic');
                  }}
                  mode="outlined"
                  autoCapitalize="characters"
                  keyboardType="numeric"
                  maxLength={12}
                  error={!!errors.nic}
                  disabled={isLoading}
                />
                {errors.nic && (
                  <Text className="mt-1 text-sm text-red-500">{errors.nic}</Text>
                )}
              </View>

              <View className="mb-4">
                <TextInput
                  label="Phone Number (10 digits)"
                  value={phoneNo}
                  onChangeText={(text) => {
                    setPhoneNo(text);
                    clearError('phoneNo');
                  }}
                  mode="outlined"
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={!!errors.phoneNo}
                  disabled={isLoading}
                />
                {errors.phoneNo && (
                  <Text className="mt-1 text-sm text-red-500">{errors.phoneNo}</Text>
                )}
              </View>

              <View className="mb-4">
                <TextInput
                  label="Email (Optional)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={!!errors.email}
                  disabled={isLoading}
                />
                {errors.email && (
                  <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
                )}
              </View>

              <View className="mb-4">
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
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

              <View className="mb-6">
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  mode="outlined"
                  secureTextEntry
                  error={!!errors.confirmPassword}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <Text className="mt-1 text-sm text-red-500">{errors.confirmPassword}</Text>
                )}
              </View>

              <View className="mb-6">
                <CustomButton 
                  title={isLoading ? "Creating Account..." : "Create Account"} 
                  onPress={handleSignup} 
                  variant="primary" 
                  size="large" 
                  fullWidth={true}
                  disabled={isLoading}
                />
              </View>

              {/* Sign In Link */}
              <View className="mb-8 flex-row items-center justify-center">
                <Text className="text-gray-600">Already have an account? </Text>
                <CustomButton
                  title="Sign In"
                  onPress={() => router.push('/auth/signIn')}
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

              {/* Google Sign Up Button */}
              <View className="mb-8">
                <CustomButton
                  title="Continue with Google"
                  onPress={handleGoogleSignup}
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
