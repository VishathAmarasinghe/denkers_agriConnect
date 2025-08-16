import CustomButton from '@/components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { changePassword } from '@/slice/authSlice/Auth';
import { AppDispatch } from '@/slice/store';

export default function ChangePasswordScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })).unwrap();
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and go back
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setErrors({});
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Password change failed:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Changes',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        {
          text: 'Continue Editing',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <CustomButton
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<MaterialIcons name="arrow-back" size={24} color="#374151" />}
            className="mr-3"
          />
          <Text className="text-xl font-semibold text-gray-800">Change Password</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Instructions */}
        <View className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-sm text-blue-800">
            <Text className="font-semibold">Security Tip:</Text> Choose a strong password that you haven't used elsewhere. 
            Your password should be at least 6 characters long and include a mix of letters, numbers, and symbols.
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Current Password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                clearError('currentPassword');
              }}
              mode="outlined"
              secureTextEntry
              error={!!errors.currentPassword}
              disabled={isLoading}
              placeholder="Enter your current password"
            />
            {errors.currentPassword && (
              <Text className="mt-1 text-sm text-red-500">{errors.currentPassword}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">New Password</Text>
            <TextInput
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearError('newPassword');
              }}
              mode="outlined"
              secureTextEntry
              error={!!errors.newPassword}
              disabled={isLoading}
              placeholder="Enter your new password"
            />
            {errors.newPassword && (
              <Text className="mt-1 text-sm text-red-500">{errors.newPassword}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirm New Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
              mode="outlined"
              secureTextEntry
              error={!!errors.confirmPassword}
              disabled={isLoading}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <Text className="mt-1 text-sm text-red-500">{errors.confirmPassword}</Text>
            )}
          </View>
        </View>

        {/* Password Requirements */}
        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</Text>
          <View className="space-y-1">
            <Text className="text-xs text-gray-600">• At least 6 characters long</Text>
            <Text className="text-xs text-gray-600">• Different from your current password</Text>
            <Text className="text-xs text-gray-600">• Consider using a mix of letters, numbers, and symbols</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-8 space-y-3">
          <CustomButton
            title={isLoading ? "Changing Password..." : "Change Password"}
            onPress={handleChangePassword}
            variant="primary"
            size="large"
            fullWidth={true}
            disabled={isLoading}
            icon={<MaterialIcons name="lock" size={20} color="#FFFFFF" />}
          />
          
          <CustomButton
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="large"
            fullWidth={true}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
