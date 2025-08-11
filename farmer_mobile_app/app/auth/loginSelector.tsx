import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginSelectorScreen() {
  const handleSignIn = () => {
    router.push('/auth/signIn');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleBack = () => {
    router.push('/auth/landingScreen');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-6">
        {/* App Logo */}
        <View className="items-center mb-8">
          <Image 
            source={images.appLogo} 
            className="w-24 h-24 mb-4"
            resizeMode="contain"
          />
        </View>
        
        {/* Welcome Text */}
        <Text className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome to AgriConnect
        </Text>
        
        {/* Buttons */}
        <View className="w-full max-w-sm space-y-4 mb-6">
          <CustomButton
            title="Sign In"
            onPress={handleSignIn}
            variant="primary"
            size="large"
            fullWidth={true}
            className='my-4'
            iconPosition="left"
          />
          
          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            variant="outline"
            size="large"
            fullWidth={true}
            iconPosition="left"
          />
        </View>

        {/* Back Button */}
        <CustomButton
          title="Back to Landing"
          onPress={handleBack}
          variant="ghost"
          size="medium"
        />
      </View>
    </SafeAreaView>
  );
}
