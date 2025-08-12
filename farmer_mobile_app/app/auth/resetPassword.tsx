import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [employeeID, setEmployeeID] = useState('');

  const handleResetPassword = () => {
    // TODO: Implement actual password reset logic
    console.log('Password reset attempt:', { email, employeeID });
    // For now, just redirect to OTP screen
    router.push('/auth/otpCode');
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 justify-center p-5">
        <View className="mb-5 items-center">
          <MaterialIcons name="lock-reset" size={80} color="#52B788" />
        </View>

        <Text className="mb-3 text-center text-3xl font-bold text-green-700">Reset Password</Text>
        <Text className="mb-8 text-center text-base text-gray-600">Enter your details to reset your password</Text>

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          className="mb-5"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Employee ID"
          value={employeeID}
          onChangeText={setEmployeeID}
          mode="outlined"
          className="mb-5"
          autoCapitalize="none"
        />

        <View className="mb-6 rounded-lg bg-green-50 p-4">
          <Text className="text-center text-sm leading-5 text-green-800">
            We'll send a verification code to your email address. Make sure to enter the correct email associated with
            your account.
          </Text>
        </View>

        <Button mode="contained" className="mb-5" onPress={handleResetPassword} style={{ backgroundColor: '#52B788' }}>
          Send Reset Code
        </Button>

        <Button mode="text" onPress={() => router.back()}>
          Back to Login
        </Button>
      </View>
    </SafeAreaView>
  );
}
