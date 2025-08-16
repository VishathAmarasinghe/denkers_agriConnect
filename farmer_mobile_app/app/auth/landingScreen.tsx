import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { router } from 'expo-router';
import { Dimensions, ImageBackground, Text, View, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const handleGetStarted = () => {
    router.push('/auth/loginSelector');
  };

  return (
    <ImageBackground source={images.landingPageImage} style={{ width, height }} className="flex-1" resizeMode="cover">

      {/* Content */}
      <View className="flex-1 justify-end px-6 pb-20">
        {/* Transparent Card */}
        <View className="mx-4 rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
          <Text className="mb-4 text-center text-4xl font-bold text-gray-800">Welcome</Text>

          <Text className="mb-8 text-center text-lg leading-6 text-gray-600">Your agriculture service provider</Text>

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
    {/* Non-blocking overlay for better text readability */}
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject} className="bg-black/30" />

    </ImageBackground>
  );
};

export default LandingScreen;
