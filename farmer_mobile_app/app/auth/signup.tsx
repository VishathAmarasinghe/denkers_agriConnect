import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // TODO: Implement actual signup logic
    console.log('Signup attempt:', { name, nic, phoneNo, email, password, confirmPassword });
    // Navigate to language selection screen
    router.push('/auth/languageScreen');
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google signup
    console.log('Google signup requested');
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
            <View className="items-center pt-8 pb-6">
              <Image 
                source={images.appLogo} 
                className="w-20 h-20 mb-4"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                Create your account
              </Text>
              <Text className="text-sm text-center text-gray-600 leading-5 px-4">
                Please note that phone verification is required for signup. Your number will only be used to verify your identity for security purposes.
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1">
              <View className="mb-4">
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  autoCapitalize="words"
                  keyboardType="default"
                />
              </View>
              
              <View className="mb-4">
                <TextInput
                  label="NIC"
                  value={nic}
                  onChangeText={setNic}
                  mode="outlined"
                  autoCapitalize="characters"
                  keyboardType="default"
                />
              </View>

              <View className="mb-4">
                <TextInput
                  label="Phone No"
                  value={phoneNo}
                  onChangeText={setPhoneNo}
                  mode="outlined"
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-4">
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              <View className="mb-4">
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry
                />
              </View>

              <View className="mb-6">
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry
                />
              </View>
              
              <View className="mb-6">
                <CustomButton
                  title="Sign Up"
                  onPress={handleSignup}
                  variant="primary"
                  size="large"
                  fullWidth={true}
                />
              </View>

              {/* Divider with OR */}
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500 font-medium">OR</Text>
                <View className="flex-1 h-px bg-gray-300" />
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
