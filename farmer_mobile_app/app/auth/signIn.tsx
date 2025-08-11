import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // TODO: Implement actual sign in logic
    console.log('Sign in attempt:', { identifier, password });
    // Navigate to dashboard tabs (will auto-redirect to home)
    router.push('/dashboard/tabs/home');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign in
    console.log('Google sign in requested');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6">
            {/* Top Section with Logo and Welcome */}
            <View className="items-center pt-8 pb-8">
              <Image 
                source={images.appLogo} 
                className="w-20 h-20 mb-4"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-center text-gray-800">
                Welcome Back
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1">
              <View className="mb-4">
                <TextInput
                  label="Phone No / NIC / Email"
                  value={identifier}
                  onChangeText={setIdentifier}
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="default"
                />
              </View>
              
              <View className="mb-6">
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry
                />
              </View>
              
              <View className="mb-6">
                <CustomButton
                  title="Sign In"
                  onPress={handleSignIn}
                  variant="primary"
                  size="large"
                  fullWidth={true}
                />
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center mb-8">
                <Text className="text-gray-600">Don't have an account? </Text>
                <CustomButton
                  title="Sign Up"
                  onPress={handleSignUp}
                  variant="ghost"
                  size="medium"
                  className="p-0 m-0"
                />
              </View>

              {/* Divider with OR */}
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500 font-medium">OR</Text>
                <View className="flex-1 h-px bg-gray-300" />
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
                    <View className="w-5 h-5 mr-2">
                      <MaterialIcons name="android" size={20} color="#4285F4" />
                    </View>
                  }
                  iconPosition="left"
                />
              </View>
            </View>

            {/* Bottom Terms and Privacy */}
            <View className="pb-6">
              <View className="flex-row justify-center items-center">
                <CustomButton
                  title="Terms"
                  onPress={() => console.log('Terms pressed')}
                  variant="ghost"
                  size="small"
                  className="p-0 m-0"
                />
                <Text className="text-gray-400 mx-2">|</Text>
                <CustomButton
                  title="Privacy Policy"
                  onPress={() => console.log('Privacy Policy pressed')}
                  variant="ghost"
                  size="small"
                  className="p-0 m-0"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
