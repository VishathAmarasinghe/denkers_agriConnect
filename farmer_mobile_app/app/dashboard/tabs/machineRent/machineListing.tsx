import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import CustomButton from '@/components/CustomButton';
import { useMachineRental } from '@/hooks/useMachineRental';
import { Equipment } from '@/utils/machineRentalService';

export default function MachineListingScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const scaleValue = useSharedValue(1);

  // Get equipment data from the hook
  const { equipment, equipmentLoading, equipmentError, fetchEquipmentByCategory } = useMachineRental();

  // Extract equipment array from the state
  const equipmentList = equipment?.data || [];
  const equipmentCount = equipment?.count || 0;
  const hasError = equipment?.error;

  const handleBack = () => {
    router.back();
  };

  const handleMachineSelect = (machineId: number) => {
    // Animate the selection
    scaleValue.value = withSpring(1.05, { damping: 10, stiffness: 100 });
    setTimeout(() => {
      scaleValue.value = withSpring(1, { damping: 10, stiffness: 100 });
    }, 150);
    
    setSelectedMachineId(machineId);
  };

  const handleViewDetails = () => {
    if (selectedMachineId) {
      // Find the selected machine from the equipment list
      const selectedMachine = equipmentList.find(machine => machine.id === selectedMachineId);
      
      if (selectedMachine) {
        // Navigate to machine details screen with the full machine object encoded in params
        router.push({
          pathname: '/dashboard/tabs/machineRent/machineDetails',
          params: { 
            machineId: selectedMachineId.toString(),
            categoryId: categoryId || '1',
            // Pass machine data as encoded JSON string
            machineData: JSON.stringify(selectedMachine)
          }
        });
      }
    }
  };

  const handleRetry = () => {
    if (categoryId) {
      // Assuming clearErrors is no longer needed or handled internally by fetchEquipmentByCategory
      // clearErrors(); 
      fetchEquipmentByCategory(parseInt(categoryId));
    }
  };

  // Load equipment when category changes
  useEffect(() => {
    console.log('Category ID:', categoryId); // Debug log
    if (categoryId) {
      console.log('Fetching equipment for category:', parseInt(categoryId)); // Debug log
      fetchEquipmentByCategory(parseInt(categoryId));
    }
  }, [categoryId, fetchEquipmentByCategory]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#000" />
      <Text className="text-base text-black mt-4">Loading equipment...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <MaterialIcons name="error-outline" size={64} color="#ef4444" />
      <Text className="text-lg font-bold text-black text-center mt-4 mb-2">
        Failed to Load Equipment
      </Text>
      <Text className="text-base text-black text-center mb-6 leading-6">
        {equipmentError || 'Unable to load equipment. Please check your internet connection and try again.'}
      </Text>
      <TouchableOpacity
        className="bg-black px-6 py-3 rounded-lg"
        onPress={handleRetry}
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <MaterialIcons name="build" size={80} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
        No Equipment Available
      </Text>
      <Text className="text-base text-gray-500 text-center px-8">
        {equipmentCount === 0 
          ? "There are no machines available in this category at the moment."
          : "No equipment found for the selected criteria."
        }
      </Text>
      <CustomButton
        title="Try Again"
        onPress={handleRetry}
        className="mt-6 px-8"
      />
    </View>
  );

  const renderMachineCard = (machine: Equipment) => (
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
              source={machine.equipment_image_url ? { uri: machine.equipment_image_url } : require('@/assets/images/eq_tractor.png')}
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
              {machine.description || 'Agricultural equipment'}
            </Text>
            <Text className="text-sm text-black mb-1">
              Daily Rate - Rs. {machine.daily_rate.toLocaleString()}
            </Text>
            <Text className="text-sm text-black">
              Contact - {machine.contact_number}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
              {categoryName || 'Equipment'}
            </Text>
          </View>

          {/* Introductory Text */}
          <Text className="text-base text-black text-left leading-6 mb-6">
            Browse available {categoryName?.toLowerCase() || 'equipment'} and cultivation machinery in your area.
          </Text>
        </View>

        {/* Machine Listings */}
        {(() => { console.log('Equipment state:', { loading: equipmentLoading, error: equipmentError, count: equipmentCount, data: equipmentList }); return null; })()}
        <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false}>
          {equipmentLoading ? (
            renderLoadingState()
          ) : equipmentError ? (
            renderErrorState()
          ) : equipmentList.length === 0 ? (
            renderEmptyState()
          ) : (
            equipmentList.map(renderMachineCard)
          )}
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
