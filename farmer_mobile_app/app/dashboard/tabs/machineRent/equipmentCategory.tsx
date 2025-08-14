import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, router } from 'expo-router';

export default function EquipmentCategoryScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // Navigate to machine listing screen with category info
    router.push({
      pathname: '/dashboard/tabs/machineRent/machineListing',
      params: { categoryId, categoryName }
    });
  };

  const equipmentCategories = [
    {
      id: '1',
      name: 'Tractors & Power\nEquipment',
      image: require('@/assets/images/eq_tractor.png'),
    },
    {
      id: '2',
      name: 'Harvesting\nMachines',
      image: require('@/assets/images/eq_harvestor.png'),
    },
    {
      id: '3',
      name: 'Planting & Seeding\nEquipment',
      image: require('@/assets/images/eq_planter.png'),
    },
    {
      id: '4',
      name: 'Tillage &\nCultivation',
      image: require('@/assets/images/eq_tiller.png'),
    },
  ];

  const renderEquipmentCard = (category: {
    id: string;
    name: string;
    image: any;
  }) => (
    <TouchableOpacity 
      key={category.id}
      className="mb-4 p-4 rounded-lg overflow-hidden flex-row items-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
      }}
      onPress={() => handleCategoryPress(category.id, category.name)}
    >
      {/* Equipment Image - Using ImageBackground instead of Image */}
      <ImageBackground
        source={category.image}
        style={{ 
          width: 160, 
          height: 96, 
          marginRight: 16,
          backgroundColor: 'transparent'
        }}
        resizeMode="contain"
      />
      
      {/* Category Name - Two lines */}
      <Text className="text-lg font-bold text-black flex-1 leading-tight">
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: '',
          headerTitle: '',
        }} 
      />
      
      <ImageBackground 
        source={require('@/assets/images/rentals.jpg')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Blurred overlay for better readability */}
        <View className="absolute inset-0 bg-black/30" />
        
        <View className="flex-1">
          {/* Header Section with Title in App Bar */}
          <View className="pt-16 px-6 pb-4">
            {/* Back Button and Title Row */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity 
                className="w-12 h-12 rounded-lg bg-gray-400 items-center justify-center"
                onPress={handleBack}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              {/* Title moved to app bar */}
              <Text className="text-2xl font-bold text-black flex-1 text-center mr-12">
                Equipment Category
              </Text>
            </View>
            
            {/* Introductory Text - Moved higher */}
            <Text className="text-base text-black text-center leading-6 mb-6 px-4">
              Select the type of machinery you need for your farming operation.
            </Text>
          </View>

          {/* Equipment Category Cards */}
          <ScrollView className="flex-1 px-6 pb-6" showsVerticalScrollIndicator={false}>
            {equipmentCategories.map(renderEquipmentCard)}
          </ScrollView>
        </View>
      </ImageBackground>
    </>
  );
}
