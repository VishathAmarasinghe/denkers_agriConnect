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
        <View className="mb-5 items-center">
          <MaterialIcons name="lock" size={80} color="#52B788" />
        </View>

        <Text className="mb-3 text-center text-3xl font-bold text-green-700">Set New Password</Text>
        <Text className="mb-8 text-center text-base text-gray-600">Create a strong password for your account</Text>

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

        <View className="mb-6 rounded-lg bg-green-50 p-4">
          <Text className="mb-2 text-sm font-medium text-green-800">Password Requirements:</Text>
          <Text className="mb-1 text-xs text-green-700">• At least 8 characters long</Text>
          <Text className="mb-1 text-xs text-green-700">• Include uppercase and lowercase letters</Text>
          <Text className="mb-1 text-xs text-green-700">• Include at least one number</Text>
          <Text className="mb-1 text-xs text-green-700">• Include at least one special character</Text>
        </View>

        <Button mode="contained" className="mb-5" onPress={handlePasswordChange} style={{ backgroundColor: '#52B788' }}>
          Update Password
        </Button>

        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    </SafeAreaView>
  );
}
