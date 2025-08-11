import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPCodeScreen() {
  const [otpCode, setOtpCode] = useState('');

  const handleVerifyOTP = () => {
    // TODO: Implement actual OTP verification logic
    console.log('OTP verification attempt:', { otpCode });
    // For now, just redirect to new password screen
    router.push('/auth/newPassword');
  };

  const handleResendOTP = () => {
    // TODO: Implement resend OTP logic
    console.log('Resend OTP requested');
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 justify-center p-5">
        <View className="items-center mb-5">
          <MaterialIcons name="sms" size={80} color="#52B788" />
        </View>
        
        <Text className="text-3xl font-bold text-green-700 text-center mb-3">Enter Verification Code</Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          We've sent a 6-digit code to your email address
        </Text>
        
        <TextInput
          label="Verification Code"
          value={otpCode}
          onChangeText={setOtpCode}
          mode="outlined"
          className="mb-5"
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
        />
        
        <View className="bg-green-50 p-4 rounded-lg mb-6">
          <Text className="text-sm text-green-800 text-center leading-5">
            Enter the 6-digit verification code sent to your email. 
            The code will expire in 10 minutes.
          </Text>
        </View>
        
        <Button 
          mode="contained" 
          className="mb-5"
          onPress={handleVerifyOTP}
          disabled={otpCode.length !== 6}
          style={{ backgroundColor: '#52B788' }}
        >
          Verify Code
        </Button>
        
        <View className="flex-row justify-center items-center mb-5">
          <Text className="text-gray-600">Didn't receive the code? </Text>
          <Button 
            mode="text" 
            onPress={handleResendOTP}
            className="p-0 m-0"
            textColor="#52B788"
          >
            Resend
          </Button>
        </View>
        
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
