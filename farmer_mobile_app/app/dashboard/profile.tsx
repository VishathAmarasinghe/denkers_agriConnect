import CustomButton from '@/components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, View, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile, selectUserProfile } from '@/slice/authSlice/Auth';
import { AppDispatch } from '@/slice/store';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector(selectUserProfile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
      });
    } else {
      // Load profile if not available
      loadProfile();
    }
  }, [userProfile]);

  const loadProfile = async () => {
    try {
      await dispatch(getProfile()).unwrap();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
      })).unwrap();
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (!userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-4">
              <MaterialIcons name="person" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-lg text-gray-600 font-medium">Loading profile...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">Profile</Text>
          </View>
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="px-6 py-2 rounded-full bg-green-500"
            >
              <Text className="text-white font-semibold">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleCancel}
                className="px-4 py-2 rounded-full border border-gray-300 mr-3"
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isLoading}
                className={`px-6 py-2 rounded-full ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
              >
                <Text className="text-white font-semibold">
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Picture Section */}
        <View className="bg-white mx-6 mt-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <View className="bg-gradient-to-br from-green-400 to-green-600 h-24" />
          <View className="px-6 pb-6 -mt-12">
            <View className="items-center">
              <View className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden mb-4">
                <View className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center">
                  <MaterialIcons name="person" size={56} color="#6B7280" />
                </View>
                {isEditing && (
                  <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 items-center justify-center border-2 border-white">
                    <MaterialIcons name="camera-alt" size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {userProfile.first_name} {userProfile.last_name}
              </Text>
              <View className="flex-row items-center bg-green-100 px-4 py-2 rounded-full">
                <MaterialIcons name="verified" size={16} color="#059669" />
                <Text className="ml-2 text-sm font-medium text-green-700 capitalize">
                  {userProfile.role || 'Farmer'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Information Cards */}
        <View className="px-6 mt-6 space-y-4">
          {/* Editable Fields */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Personal Information</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
                <TextInput
                  value={formData.first_name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, first_name: text });
                    clearError('first_name');
                  }}
                  mode="outlined"
                  editable={isEditing}
                  error={!!errors.first_name}
                  disabled={!isEditing}
                  style={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      primary: '#059669',
                      error: '#EF4444',
                      outline: isEditing ? '#059669' : '#E5E7EB',
                    },
                  }}
                />
                {errors.first_name && (
                  <Text className="mt-1 text-sm text-red-500">{errors.first_name}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
                <TextInput
                  value={formData.last_name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, last_name: text });
                    clearError('last_name');
                  }}
                  mode="outlined"
                  editable={isEditing}
                  error={!!errors.last_name}
                  disabled={!isEditing}
                  style={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      primary: '#059669',
                      error: '#EF4444',
                      outline: isEditing ? '#059669' : '#E5E7EB',
                    },
                  }}
                />
                {errors.last_name && (
                  <Text className="mt-1 text-sm text-red-500">{errors.last_name}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    clearError('email');
                  }}
                  mode="outlined"
                  editable={isEditing}
                  error={!!errors.email}
                  disabled={!isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      primary: '#059669',
                      error: '#EF4444',
                      outline: isEditing ? '#059669' : '#E5E7EB',
                    },
                  }}
                />
                {errors.email && (
                  <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    clearError('phone');
                  }}
                  mode="outlined"
                  editable={isEditing}
                  error={!!errors.phone}
                  disabled={!isEditing}
                  keyboardType="phone-pad"
                  style={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      primary: '#059669',
                      error: '#EF4444',
                      outline: isEditing ? '#059669' : '#E5E7EB',
                    },
                  }}
                />
                {errors.phone && (
                  <Text className="mt-1 text-sm text-red-500">{errors.phone}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Read-only Information */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Account Details</Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <MaterialIcons name="badge" size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">NIC Number</Text>
                </View>
                <Text className="text-sm text-gray-900 font-mono">{userProfile.nic || 'N/A'}</Text>
              </View>

              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                    <MaterialIcons name="person" size={16} color="#8B5CF6" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">Username</Text>
                </View>
                <Text className="text-sm text-gray-900 font-medium">{userProfile.username}</Text>
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                    <MaterialIcons name="calendar-today" size={16} color="#059669" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">Member Since</Text>
                </View>
                <Text className="text-sm text-gray-900">
                  {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Account Actions</Text>
            
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => router.push('/dashboard/changePassword')}
                className="flex-row items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <MaterialIcons name="lock" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text className="text-base font-medium text-gray-800">Change Password</Text>
                    <Text className="text-sm text-gray-500">Update your account password</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon')}
                className="flex-row items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                    <MaterialIcons name="security" size={20} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text className="text-base font-medium text-gray-800">Privacy Settings</Text>
                    <Text className="text-sm text-gray-500">Manage your privacy preferences</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
