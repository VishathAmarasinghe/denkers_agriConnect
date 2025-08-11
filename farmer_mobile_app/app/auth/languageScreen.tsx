import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LanguageScreen() {
  const handleLanguageSelect = (language: string) => {
    // TODO: Store selected language preference
    console.log('Language selected:', language);
    // Navigate to location screen
    router.push('/auth/locationScreen');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {/* Translation Image */}
        <View className="items-center mb-8">
          <Image 
            source={images.translationImage} 
            className="w-32 h-32 mb-6"
            resizeMode="contain"
          />
        </View>

        {/* Language Selection Text */}
        <Text className="text-2xl font-bold text-center text-gray-800 mb-12">
          Select Your Preferred Language
        </Text>

        {/* Language Buttons */}
        <View className="w-full max-w-sm space-y-4">
          <CustomButton
            title="English"
            onPress={() => handleLanguageSelect('English')}
            variant="outline"
            size="large"
            fullWidth={true}
            className="mb-4"
          />
          
          <CustomButton
            title="Sinhala"
            onPress={() => handleLanguageSelect('Sinhala')}
            variant="outline"
            size="large"
            fullWidth={true}
            className="mb-4"
          />
          
          <CustomButton
            title="Tamil"
            onPress={() => handleLanguageSelect('Tamil')}
            variant="outline"
            size="large"
            fullWidth={true}
            className="mb-4"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
