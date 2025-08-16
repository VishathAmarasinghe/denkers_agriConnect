import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import { useMachineRental } from '@/hooks/useMachineRental';
import { Equipment } from '@/utils/machineRentalService';

export default function MachineDetailsScreen() {
  const { machineId, categoryId, machineData } = useLocalSearchParams<{ 
    machineId: string; 
    categoryId: string; 
    machineData: string;
  }>();
  const [machine, setMachine] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchEquipmentById } = useMachineRental();

  const handleBack = () => {
    router.back();
  };

  const handleRentMachine = () => {
    if (machine) {
      console.log('MachineDetails - Passing machine data:', machine);
      // Navigate to rental booking screen with machine data
    router.push({
      pathname: '/dashboard/tabs/machineRent/rentalBooking',
      params: { 
        machineId: machineId || '1',
          categoryId: categoryId || '1',
          machineData: JSON.stringify(machine) // Pass the machine data
        }
      });
    }
  };

  const handleRetry = () => {
    if (machineId) {
      loadMachineDetails();
    }
  };

  const loadMachineDetails = async () => {
    if (!machineId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First try to use the passed machine data
      if (machineData) {
        try {
          const parsedMachine = JSON.parse(machineData);
          setMachine(parsedMachine);
          setLoading(false);
          return;
        } catch (parseError) {
          console.warn('Failed to parse machine data from params, falling back to API call');
        }
      }
      
      // Fallback to API call if no machine data or parsing failed
      const equipment = await fetchEquipmentById(parseInt(machineId));
      if (equipment) {
        setMachine(equipment);
      } else {
        setError('Equipment not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load equipment details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load machine details on mount
  useEffect(() => {
    console.log('MachineDetails - machineId:', machineId);
    console.log('MachineDetails - machineData:', machineData);
    loadMachineDetails();
  }, [machineId]);

  const renderLoadingState = () => (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#000" />
      <Text className="text-lg text-gray-600 mt-4">Loading machine details...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <MaterialIcons name="error-outline" size={64} color="#ef4444" />
      <Text className="text-lg font-bold text-black text-center mt-4 mb-2">
        Failed to Load Equipment
      </Text>
      <Text className="text-base text-black text-center mb-6 leading-6">
        {error || 'Unable to load equipment details. Please check your internet connection and try again.'}
      </Text>
      <TouchableOpacity
        className="bg-black px-6 py-3 rounded-lg"
        onPress={handleRetry}
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
      </View>
    );

  if (loading) {
    return renderLoadingState();
  }

  if (error || !machine) {
    return renderErrorState();
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
              source={machine.equipment_image_url ? { uri: machine.equipment_image_url } : require('@/assets/images/eq_tractor.png')}
              style={{ width: 280, height: 200 }}
              resizeMode="contain"
            />
          </View>

          {/* Machine Title and Specs */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-black mb-2">
              {machine.name}
            </Text>
            {/* Equipment Description */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-black mb-2">Description</Text>
              <Text className="text-base text-gray-700 leading-6">
                {machine.description}
            </Text>
            </View>
          </View>

          {/* Information Sections */}
          <View className="space-y-4 mb-8">
            {/* Machine Specifications */}
            {machine.specifications && (
            <View>
                <Text className="text-lg font-bold text-black mb-2">Specifications</Text>
              <View className="bg-gray-100 p-4 rounded-lg">
                  <Text className="text-base text-black">
                    {typeof machine.specifications === 'string' 
                      ? machine.specifications 
                      : JSON.stringify(machine.specifications, null, 2)
                    }
                  </Text>
              </View>
            </View>
            )}

            {/* Contact Information */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Contact Information</Text>
              <View className="bg-gray-100 p-4 rounded-lg">
                <Text className="text-base text-black">Phone: {machine.contact_number}</Text>
              </View>
            </View>

            {/* Rental Fees */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Rental Fees</Text>
              <View className="bg-gray-100 p-4 rounded-lg space-y-2">
                <Text className="text-base text-black">Per Day - Rs. {parseInt(String(machine.daily_rate || '0').replace('.00', '')).toLocaleString()}</Text>
                <Text className="text-base text-black">Per Week - Rs. {parseInt(String(machine.weekly_rate || '0').replace('.00', '')).toLocaleString()}</Text>
                {machine.monthly_rate && (
                  <Text className="text-base text-black">Per Month - Rs. {parseInt(String(machine.monthly_rate || '0').replace('.00', '')).toLocaleString()}</Text>
                )}
              </View>
            </View>

            {/* Other Fees */}
            <View>
              <Text className="text-lg font-bold text-black mb-2">Other Fees</Text>
              <View className="bg-gray-100 p-4 rounded-lg space-y-2">
                <Text className="text-base text-black">Delivery Fee - Rs. {parseInt(String(machine.delivery_fee || '0').replace('.00', '')).toLocaleString()}</Text>
                <Text className="text-base text-black">Security Deposit - Rs. {parseInt(String(machine.security_deposit || '0').replace('.00', '')).toLocaleString()}</Text>
              </View>
            </View>

            {/* Maintenance Notes */}
            {machine.maintenance_notes && (
              <View>
                <Text className="text-lg font-bold text-black mb-2">Maintenance Notes</Text>
                <View className="bg-gray-100 p-4 rounded-lg">
                  <Text className="text-base text-black">{machine.maintenance_notes}</Text>
              </View>
            </View>
            )}
          </View>
        </ScrollView>

        {/* Rent Machine Button */}
        <View className="px-6 pb-8">
          <CustomButton
            title="Rent Machine"
            onPress={handleRentMachine}
            className="w-full py-4"
            variant="primary"
          />
        </View>
      </View>
    </>
  );
}
