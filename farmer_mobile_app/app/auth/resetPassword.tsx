import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { forgotPassword, resetPassword } from '@/slice/authSlice/Auth';
import { AppDispatch } from '@/slice/store';

export default function ResetPasswordScreen() {
  const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
  const [nic, setNic] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nic?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const dispatch = useDispatch<AppDispatch>();

  const validateForgotPassword = () => {
    const newErrors: typeof errors = {};
    
    if (!nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (nic.trim().length !== 12) {
      newErrors.nic = 'NIC must be 12 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPassword = () => {
    const newErrors: typeof errors = {};

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otp.trim().length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForgotPassword()) {
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(forgotPassword({ nic: nic.trim() })).unwrap();
      setStep('reset');
      setErrors({});
    } catch (error) {
      console.error('Forgot password failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateResetPassword()) {
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(resetPassword({
        nic: nic.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      })).unwrap();
      
      // Show success message and navigate back to sign in
      router.replace('/auth/signIn');
    } catch (error) {
      console.error('Reset password failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const goBackToSignIn = () => {
    router.replace('/auth/signIn');
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
            {/* Header */}
            <View className="flex-row items-center pb-6 pt-4">
              <CustomButton
                title=""
                onPress={goBackToSignIn}
                variant="ghost"
                size="small"
                icon={<MaterialIcons name="arrow-back" size={24} color="#374151" />}
                className="mr-4"
              />
              <Text className="text-xl font-semibold text-gray-800">
                {step === 'forgot' ? 'Forgot Password' : 'Reset Password'}
              </Text>
            </View>

            {/* Top Section with Logo */}
            <View className="items-center pb-8">
              <Image source={images.appLogo} className="mb-4 h-16 w-16" resizeMode="contain" />
              <Text className="text-center text-lg font-medium text-gray-700">
                {step === 'forgot' 
                  ? 'Enter your NIC to receive a verification code'
                  : 'Enter the verification code and set your new password'
                }
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1">
              {step === 'forgot' ? (
                // Forgot Password Step
                <View>
                  <View className="mb-6">
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

                  <View className="mb-6">
                    <CustomButton 
                      title={isLoading ? "Sending OTP..." : "Send OTP"} 
                      onPress={handleForgotPassword} 
                      variant="primary" 
                      size="large" 
                      fullWidth={true}
                      disabled={isLoading}
                    />
                  </View>
                </View>
              ) : (
                // Reset Password Step
                <View>
                  <View className="mb-4">
                    <TextInput
                      label="Verification Code (6 digits)"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        clearError('otp');
                      }}
                      mode="outlined"
                      keyboardType="numeric"
                      maxLength={6}
                      error={!!errors.otp}
                      disabled={isLoading}
                    />
                    {errors.otp && (
                      <Text className="mt-1 text-sm text-red-500">{errors.otp}</Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <TextInput
                      label="New Password"
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        clearError('newPassword');
                      }}
                      mode="outlined"
                      secureTextEntry
                      error={!!errors.newPassword}
                      disabled={isLoading}
                    />
                    {errors.newPassword && (
                      <Text className="mt-1 text-sm text-red-500">{errors.newPassword}</Text>
                    )}
                  </View>

                  <View className="mb-6">
                    <TextInput
                      label="Confirm New Password"
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
                      title={isLoading ? "Resetting Password..." : "Reset Password"} 
                      onPress={handleResetPassword} 
                      variant="primary" 
                      size="large" 
                      fullWidth={true}
                      disabled={isLoading}
                    />
                  </View>

                  {/* Back to Forgot Password */}
                  <View className="items-center">
                    <CustomButton
                      title="Back to Forgot Password"
                      onPress={() => {
                        setStep('forgot');
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setErrors({});
                      }}
                      variant="ghost"
                      size="medium"
                      disabled={isLoading}
                    />
                  </View>
                </View>
              )}

              {/* Back to Sign In */}
              <View className="mt-8 items-center">
                <CustomButton
                  title="Back to Sign In"
                  onPress={goBackToSignIn}
                  variant="ghost"
                  size="medium"
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
