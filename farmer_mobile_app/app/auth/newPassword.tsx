import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = () => {
    // TODO: Implement actual password change logic
    console.log('Password change attempt:', { newPassword, confirmPassword });
    // For now, just redirect back
    router.push('/auth/passwordChanged');
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 justify-center p-5">
        <View className="items-center mb-5">
          <MaterialIcons name="lock" size={80} color="#52B788" />
        </View>
        
        <Text className="text-3xl font-bold text-green-700 text-center mb-3">Set New Password</Text>
        <Text className="text-base text-gray-600 text-center mb-8">Create a strong password for your account</Text>
        
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          className="mb-5"
          secureTextEntry
        />
        
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          className="mb-5"
          secureTextEntry
        />
        
        <View className="bg-green-50 p-4 rounded-lg mb-6">
          <Text className="text-sm font-medium text-green-800 mb-2">Password Requirements:</Text>
          <Text className="text-xs text-green-700 mb-1">• At least 8 characters long</Text>
          <Text className="text-xs text-green-700 mb-1">• Include uppercase and lowercase letters</Text>
          <Text className="text-xs text-green-700 mb-1">• Include at least one number</Text>
          <Text className="text-xs text-green-700 mb-1">• Include at least one special character</Text>
        </View>
        
        <Button 
          mode="contained" 
          className="mb-5"
          onPress={handlePasswordChange}
          style={{ backgroundColor: '#52B788' }}
        >
          Update Password
        </Button>
        
        <Button 
          mode="text" 
          onPress={() => router.back()}
        >
          Back
        </Button>
      </View>
    </SafeAreaView>
  );
}
