import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import CustomButton from '@/components/CustomButton';

const { width, height } = Dimensions.get('window');

export default function MachineRentScreen() {
  const handleRentMachine = () => {
    router.push('/dashboard/tabs/machineRent/equipmentCategory');
  };

  const handleViewRequests = () => {
    router.push('/dashboard/tabs/machineRent/rentalRequests');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: '',
          headerTitle: '',
        }} 
      />
      
      <View className="flex-1 bg-white">
        {/* Top Section - Agricultural Background Image (45% of screen) */}
        <View className="h-[45%] relative">
          <ImageBackground 
            source={require('@/assets/images/rentals.jpg')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          >
            {/* Back Button Overlay */}
            <TouchableOpacity 
              className="absolute top-16 left-4 w-12 h-12 rounded-full bg-gray-500 items-center justify-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {/* Bottom Section - White Content Card (55% of screen) with curved top edge */}
        <View className="flex-1 bg-white relative">
          {/* Curved top edge using View with border radius */}
          <View className="absolute -top-8 left-0 right-0 h-16 bg-white rounded-t-[40px]" />
          
          {/* Content */}
          <View className="flex-1 px-8 pt-4 pb-40">
            {/* Title */}
            <Text className="text-3xl font-bold text-black text-center mb-6 leading-tight">
              Get the Right Machine{'\n'}For Your Farm
            </Text>

            {/* Description */}
            <Text className="text-base text-gray-700 text-center leading-6 mb-8 px-4">
              Access a wide range of modern agricultural machinery without the high investment costs. Choose from tractors, harvesters, planters, and specialized equipment with flexible rental periods, delivery service, and optional trained operators.
            </Text>

            {/* Action Buttons */}
            <View className="px-4">
              <CustomButton 
                title="Rent a Machine" 
                onPress={handleRentMachine} 
                variant="primary" 
                size="large" 
                fullWidth={true} 
                className="mb-2"
              />
              
              <CustomButton 
                title="View My Rentals" 
                onPress={handleViewRequests} 
                variant="outline" 
                size="large" 
                fullWidth={true} 
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
