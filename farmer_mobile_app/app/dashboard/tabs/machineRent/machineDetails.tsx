import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import CustomButton from '@/components/CustomButton';

interface MachineDetails {
  id: string;
  name: string;
  power: string;
  specs: string;
  rental: string;
  contact: string;
  image: any;
  location: string;
  dailyRate: string;
  weeklyRate: string;
  deliveryFee: string;
  driverFee: string;
}

export default function MachineDetailsScreen() {
  const { machineId, categoryId } = useLocalSearchParams<{ machineId: string; categoryId: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleRentMachine = () => {
    // Navigate to rental booking screen
    router.push({
      pathname: '/dashboard/tabs/machineRent/rentalBooking',
      params: { 
        machineId: machineId || '1',
        categoryId: categoryId || '1'
      }
    });
  };

  // Get machine details based on machineId and categoryId
  const getMachineDetails = (machineId: string, categoryId: string): MachineDetails | null => {
    const machines = {
      '1': { // Tractors & Power Equipment
        '1': {
          id: '1',
          name: 'Mahindra 575 DI (75 HP)',
          power: '75 HP | 4WD | Diesel',
          rental: 'Rental - Rs. 1,200/day | Rs.7,000/week',
          contact: '076 985 3423',
          specs: 'Power: 75 HP | 4WD | Diesel',
          image: require('@/assets/images/eq_tractor.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 1,200.00',
          weeklyRate: 'Rs. 7,000.00',
          deliveryFee: 'Rs. 2,400.00',
          driverFee: 'Rs. 2,500.00'
        },
        '2': {
          id: '2',
          name: 'John Deere 5050D (50 HP)',
          power: '50 HP | 2WD | Diesel',
          rental: 'Rental - Rs. 900/day | Rs.5,500/week',
          contact: '076 985 3424',
          specs: 'Power: 50 HP | 2WD | Diesel',
          image: require('@/assets/images/eq_tractor.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 900.00',
          weeklyRate: 'Rs. 5,500.00',
          deliveryFee: 'Rs. 2,000.00',
          driverFee: 'Rs. 2,000.00'
        },
        '3': {
          id: '3',
          name: 'New Holland 3630 (30 HP)',
          power: '30 HP | 2WD | Diesel',
          rental: 'Rental - Rs. 700/day | Rs.4,200/week',
          contact: '076 985 3425',
          specs: 'Power: 30 HP | 2WD | Diesel',
          image: require('@/assets/images/eq_tractor.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 700.00',
          weeklyRate: 'Rs. 4,200.00',
          deliveryFee: 'Rs. 1,800.00',
          driverFee: 'Rs. 1,800.00'
        },
        '4': {
          id: '4',
          name: 'Kubota L2501 (25 HP)',
          power: '25 HP | 4WD | Diesel',
          rental: 'Rental - Rs. 600/day | Rs.3,600/week',
          contact: '076 985 3426',
          specs: 'Power: 25 HP | 4WD | Diesel',
          image: require('@/assets/images/eq_tractor.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 600.00',
          weeklyRate: 'Rs. 3,600.00',
          deliveryFee: 'Rs. 1,500.00',
          driverFee: 'Rs. 1,500.00'
        }
      },
      '2': { // Harvesting Machines
        '1': {
          id: '1',
          name: 'Combine Harvester CX8070',
          power: '270 HP | 4WD | Diesel',
          rental: 'Rental - Rs. 3,500/day | Rs.21,000/week',
          contact: '076 985 3427',
          specs: 'Power: 270 HP | 4WD | Diesel',
          image: require('@/assets/images/eq_harvestor.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 3,500.00',
          weeklyRate: 'Rs. 21,000.00',
          deliveryFee: 'Rs. 5,000.00',
          driverFee: 'Rs. 3,500.00'
        },
        '2': {
          id: '2',
          name: 'Grain Header 30ft',
          power: 'Attachable | 30ft Width',
          rental: 'Rental - Rs. 800/day | Rs.4,800/week',
          contact: '076 985 3428',
          specs: 'Width: 30ft | Attachable',
          image: require('@/assets/images/eq_harvestor.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 800.00',
          weeklyRate: 'Rs. 4,800.00',
          deliveryFee: 'Rs. 2,500.00',
          driverFee: 'Rs. 1,500.00'
        }
      },
      '3': { // Planting & Seeding Equipment
        '1': {
          id: '1',
          name: 'Planter 12 Row',
          power: '12 Row | Hydraulic',
          rental: 'Rental - Rs. 500/day | Rs.3,000/week',
          contact: '076 985 3429',
          specs: 'Rows: 12 | Type: Hydraulic',
          image: require('@/assets/images/eq_planter.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 500.00',
          weeklyRate: 'Rs. 3,000.00',
          deliveryFee: 'Rs. 1,200.00',
          driverFee: 'Rs. 1,000.00'
        },
        '2': {
          id: '2',
          name: 'Seed Drill 8 Row',
          power: '8 Row | Mechanical',
          rental: 'Rental - Rs. 400/day | Rs.2,400/week',
          contact: '076 985 3430',
          specs: 'Rows: 8 | Type: Mechanical',
          image: require('@/assets/images/eq_planter.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 400.00',
          weeklyRate: 'Rs. 2,400.00',
          deliveryFee: 'Rs. 1,000.00',
          driverFee: 'Rs. 800.00'
        }
      },
      '4': { // Tillage & Cultivation
        '1': {
          id: '1',
          name: 'Disc Harrow 8ft',
          power: '8ft Width | Hydraulic',
          rental: 'Rental - Rs. 300/day | Rs.1,800/week',
          contact: '076 985 3431',
          specs: 'Width: 8ft | Type: Hydraulic',
          image: require('@/assets/images/eq_tiller.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 300.00',
          weeklyRate: 'Rs. 1,800.00',
          deliveryFee: 'Rs. 800.00',
          driverFee: 'Rs. 600.00'
        },
        '2': {
          id: '2',
          name: 'Rotary Tiller 6ft',
          power: '6ft Width | PTO Driven',
          rental: 'Rental - Rs. 250/day | Rs.1,500/week',
          contact: '076 985 3432',
          specs: 'Width: 6ft | Type: PTO Driven',
          image: require('@/assets/images/eq_tiller.png'),
          location: 'Mihinthale Extension Office',
          dailyRate: 'Rs. 250.00',
          weeklyRate: 'Rs. 1,500.00',
          deliveryFee: 'Rs. 600.00',
          driverFee: 'Rs. 500.00'
        }
      }
    };

    return machines[categoryId]?.[machineId] || null;
  };

  const machine = getMachineDetails(machineId || '1', categoryId || '1');

  if (!machine) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Machine not found</Text>
      </View>
    );
  }

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
        {/* Header */}
        <View className="pt-16 px-6 pb-4 bg-white">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center"
              onPress={handleBack}
            >
              <MaterialIcons name="arrow-back" size={24} color="#666" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-black flex-1 text-center mr-12">
              Rent Machine
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pb-6" showsVerticalScrollIndicator={false}>
          {/* Machine Image */}
          <View className="items-center mb-6">
            <Image
              source={machine.image}
              style={{ width: 280, height: 200 }}
              resizeMode="contain"
            />
          </View>

          {/* Machine Title and Specs */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-black mb-2">
              {machine.name}
            </Text>
            <Text className="text-base text-black">
              {machine.specs}
            </Text>
          </View>

          {/* Information Sections */}
          <View className="space-y-4 mb-8">
            {/* Machine Location */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Machine Location</Text>
              <View className="bg-gray-100 p-4 rounded-lg">
                <Text className="text-base text-black">{machine.location}</Text>
              </View>
            </View>

            {/* Contact No. */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Contact No.</Text>
              <View className="bg-gray-100 p-4 rounded-lg">
                <Text className="text-base text-black">{machine.contact}</Text>
              </View>
            </View>

            {/* Rental Fees */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Rental Fees</Text>
              <View className="bg-gray-100 p-4 rounded-lg space-y-2">
                <Text className="text-base text-black">Per Day - {machine.dailyRate}</Text>
                <Text className="text-base text-black">Per Week - {machine.weeklyRate}</Text>
              </View>
            </View>

            {/* Other Fees */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Other Fees</Text>
              <View className="bg-gray-100 p-4 rounded-lg space-y-2">
                <Text className="text-base text-black">Delivery Fee - {machine.deliveryFee}</Text>
                <Text className="text-base text-black">Driver Fee - {machine.driverFee} (per day)</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Rent Machine Button */}
        <View className="px-6 pb-8">
          <CustomButton
            title="Rent Machine"
            onPress={handleRentMachine}
            variant="primary"
            size="large"
            fullWidth={true}
          />
        </View>
      </View>
    </>
  );
}
