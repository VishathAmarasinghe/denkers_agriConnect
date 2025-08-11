import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { router } from 'expo-router';
import { Dimensions, ImageBackground, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const handleGetStarted = () => {
    router.push('/auth/loginSelector');
  };

  return (
    <ImageBackground
      source={images.landingPageImage}
      style={{ width, height }}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Overlay for better text readability */}
      <View className="flex-1 bg-black/20" />
      
      {/* Content */}
      <View className="flex-1 justify-end pb-20 px-6">
        {/* Transparent Card */}
        <View className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mx-4 shadow-2xl">
          <Text className="text-4xl font-bold text-center text-gray-800 mb-4">
            Welcome
          </Text>
          
          <Text className="text-lg text-center text-gray-600 mb-8 leading-6">
            Your agriculture service provider
          </Text>
          
          {/* Custom Button */}
          <CustomButton
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            fullWidth={true}
            className="shadow-lg"
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default LandingScreen;
