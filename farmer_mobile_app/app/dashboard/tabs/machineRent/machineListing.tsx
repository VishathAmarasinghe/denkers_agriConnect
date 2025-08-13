import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import CustomButton from '@/components/CustomButton';

interface Machine {
  id: string;
  name: string;
  power: string;
  specs: string;
  rental: string;
  contact: string;
  image: any;
  isSelected?: boolean;
}

export default function MachineListingScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const scaleValue = useSharedValue(1);

  const handleBack = () => {
    router.back();
  };

  const handleMachineSelect = (machineId: string) => {
    // Animate the selection
    scaleValue.value = withSpring(1.05, { damping: 10, stiffness: 100 });
    setTimeout(() => {
      scaleValue.value = withSpring(1, { damping: 10, stiffness: 100 });
    }, 150);
    
    setSelectedMachineId(machineId);
  };

  const handleViewDetails = () => {
    if (selectedMachineId) {
      // Navigate to machine details screen with selected machine
      router.push({
        pathname: '/dashboard/tabs/machineRent/machineDetails',
        params: { 
          machineId: selectedMachineId,
          categoryId: categoryId || '1'
        }
      });
    }
  };

  // Dynamic machine data based on category
  const getMachinesForCategory = (categoryId: string): Machine[] => {
    switch (categoryId) {
      case '1': // Tractors & Power Equipment
        return [
          {
            id: '1',
            name: 'Mahindra 575 DI (75 HP)',
            power: '75 HP | 4WD | Diesel',
            rental: 'Rental - Rs. 1,200/day | Rs.7,000/week',
            contact: 'Contact - 076 985 3423',
            specs: 'Power: 75 HP | 4WD | Diesel',
            image: require('@/assets/images/eq_tractor.png')
          },
          {
            id: '2',
            name: 'John Deere 5050D (50 HP)',
            power: '50 HP | 2WD | Diesel',
            rental: 'Rental - Rs. 900/day | Rs.5,500/week',
            contact: 'Contact - 076 985 3424',
            specs: 'Power: 50 HP | 2WD | Diesel',
            image: require('@/assets/images/eq_tractor.png')
          },
          {
            id: '3',
            name: 'New Holland 3630 (30 HP)',
            power: '30 HP | 2WD | Diesel',
            rental: 'Rental - Rs. 700/day | Rs.4,200/week',
            contact: 'Contact - 076 985 3425',
            specs: 'Power: 30 HP | 2WD | Diesel',
            image: require('@/assets/images/eq_tractor.png')
          },
          {
            id: '4',
            name: 'Kubota L2501 (25 HP)',
            power: '25 HP | 4WD | Diesel',
            rental: 'Rental - Rs. 600/day | Rs.3,600/week',
            contact: 'Contact - 076 985 3426',
            specs: 'Power: 25 HP | 4WD | Diesel',
            image: require('@/assets/images/eq_tractor.png')
          }
        ];
      case '2': // Harvesting Machines
        return [
          {
            id: '1',
            name: 'Combine Harvester CX8070',
            power: '270 HP | 4WD | Diesel',
            rental: 'Rental - Rs. 3,500/day | Rs.21,000/week',
            contact: 'Contact - 076 985 3427',
            specs: 'Power: 270 HP | 4WD | Diesel',
            image: require('@/assets/images/eq_harvestor.png')
          },
          {
            id: '2',
            name: 'Grain Header 30ft',
            power: 'Attachable | 30ft Width',
            rental: 'Rental - Rs. 800/day | Rs.4,800/week',
            contact: 'Contact - 076 985 3428',
            specs: 'Width: 30ft | Attachable',
            image: require('@/assets/images/eq_harvestor.png')
          }
        ];
      case '3': // Planting & Seeding Equipment
        return [
          {
            id: '1',
            name: 'Planter 12 Row',
            power: '12 Row | Hydraulic',
            rental: 'Rental - Rs. 500/day | Rs.3,000/week',
            contact: 'Contact - 076 985 3429',
            specs: 'Rows: 12 | Type: Hydraulic',
            image: require('@/assets/images/eq_planter.png')
          },
          {
            id: '2',
            name: 'Seed Drill 8 Row',
            power: '8 Row | Mechanical',
            rental: 'Rental - Rs. 400/day | Rs.2,400/week',
            contact: 'Contact - 076 985 3430',
            specs: 'Rows: 8 | Type: Mechanical',
            image: require('@/assets/images/eq_planter.png')
          }
        ];
      case '4': // Tillage & Cultivation
        return [
          {
            id: '1',
            name: 'Disc Harrow 8ft',
            power: '8ft Width | Hydraulic',
            rental: 'Rental - Rs. 300/day | Rs.1,800/week',
            contact: 'Contact - 076 985 3431',
            specs: 'Width: 8ft | Type: Hydraulic',
            image: require('@/assets/images/eq_tiller.png')
          },
          {
            id: '2',
            name: 'Rotary Tiller 6ft',
            power: '6ft Width | PTO Driven',
            rental: 'Rental - Rs. 250/day | Rs.1,500/week',
            contact: 'Contact - 076 985 3432',
            specs: 'Width: 6ft | Type: PTO Driven',
            image: require('@/assets/images/eq_tiller.png')
          }
        ];
      default:
        return [];
    }
  };

  const machines = getMachinesForCategory(categoryId || '1');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

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
        {/* Header Section */}
        <View className="pt-16 px-6 pb-4 bg-white">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center"
              onPress={handleBack}
            >
              <MaterialIcons name="arrow-back" size={24} color="#666" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-black flex-1 text-center mr-12">
              {categoryName || 'Tractors'}
            </Text>
          </View>

          {/* Introductory Text */}
          <Text className="text-base text-black text-left leading-6 mb-6">
            Browse available {categoryName?.toLowerCase() || 'tractors'} and cultivation machinery in your area.
          </Text>
        </View>

        {/* Machine Listings */}
        <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false}>
          {machines.map((machine) => (
            <Animated.View
              key={machine.id}
              style={[
                {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                },
                selectedMachineId === machine.id && animatedStyle
              ]}
            >
              <TouchableOpacity
                className={`mb-3 p-2.5 rounded-lg bg-white ${
                  selectedMachineId === machine.id ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200'
                }`}
                onPress={() => handleMachineSelect(machine.id)}
                activeOpacity={0.7}
              >
              <View className="flex-row items-center">
                {/* Machine Image */}
                <View className="mr-3">
                  <Image
                    source={machine.image}
                    style={{ width: 100, height: 70 }}
                    resizeMode="cover"
                  />
                </View>

                {/* Machine Details */}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-black mb-2">
                    {machine.name}
                  </Text>
                  <Text className="text-sm text-black mb-1">
                    {machine.specs}
                  </Text>
                  <Text className="text-sm text-black mb-1">
                    {machine.rental}
                  </Text>
                  <Text className="text-sm text-black">
                    {machine.contact}
                  </Text>
                </View>
              </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* View Details Button */}
        <View className="px-6 pb-8 pt-4">
          <CustomButton
            title={selectedMachineId ? "View Details" : "Select a machine to view details"}
            onPress={handleViewDetails}
            variant={selectedMachineId ? "primary" : "secondary"}
            size="large"
            fullWidth={true}
            disabled={!selectedMachineId}
          />
        </View>
      </View>
    </>
  );
}
