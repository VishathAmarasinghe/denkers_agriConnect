import CustomButton from '@/components/CustomButton';
import { GOOGLE_PLACES_CONFIG } from '@/config/googlePlaces';
import { images } from '@/constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationScreen() {
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSetLocation = () => {
    if (selectedLocation) {
      // TODO: Store selected location
      console.log('Location set:', selectedLocation);
      // Navigate to dashboard tabs (will auto-redirect to home)
      router.push('/dashboard/tabs');
    }
  };

  const handleNotNow = () => {
    // TODO: Handle skip location
    console.log('Location skipped');
    // Navigate to dashboard tabs (will auto-redirect to home)
    router.push('/dashboard/tabs');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Top Section with Location Image */}
        <View className="items-center pb-6 pt-8">
          <Image source={images.locationImage} className="mb-6 h-32 w-32" resizeMode="contain" />
        </View>

        {/* Location Text Section */}
        <View className="mb-8 items-center">
          <Text className="mb-4 text-center text-2xl font-bold text-gray-800">Set your location</Text>
          <Text className="px-4 text-center text-base leading-6 text-gray-600">
            We will need your location to show local deals and faster delivery.
          </Text>
        </View>

        {/* Google Places Autocomplete */}
        <View className="mb-8">
          <GooglePlacesAutocomplete
            placeholder="Search for your location"
            onPress={(data, details = null) => {
              setSelectedLocation(data.description);
              console.log('Location selected:', data.description);
            }}
            query={{
              key: GOOGLE_PLACES_CONFIG.apiKey,
              language: GOOGLE_PLACES_CONFIG.language,
              types: GOOGLE_PLACES_CONFIG.types,
            }}
            enablePoweredByContainer={false}
            fetchDetails={true}
            minLength={GOOGLE_PLACES_CONFIG.minLength}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={GOOGLE_PLACES_CONFIG.debounce}
          />
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <CustomButton
            title="Set Location"
            onPress={handleSetLocation}
            variant="primary"
            size="large"
            fullWidth={true}
            className="my-4"
            disabled={!selectedLocation}
          />

          <CustomButton title="Not Now" onPress={handleNotNow} variant="outline" size="large" fullWidth={true} />
        </View>
      </View>
    </SafeAreaView>
  );
}
