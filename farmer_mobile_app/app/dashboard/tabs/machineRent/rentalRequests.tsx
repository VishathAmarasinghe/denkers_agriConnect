import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import { useMachineRental } from '@/hooks/useMachineRental';
import { EquipmentRentalRequest } from '@/utils/machineRentalService';

export default function RentalRequestsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    rentalRequests,
    rentalRequestsLoading,
    rentalRequestsError,
    fetchMyRentalRequests,
    cancelRentalRequest,
    clearErrors
  } = useMachineRental();

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyRentalRequests();
    setRefreshing(false);
  };

  const handleRetry = () => {
    clearErrors();
    fetchMyRentalRequests();
  };

  const handleCancelRequest = async (request: EquipmentRentalRequest) => {
    if (request.status !== 'pending') {
      Alert.alert('Cannot Cancel', 'Only pending requests can be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Rental Request',
      `Are you sure you want to cancel your rental request for ${request.equipment_name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRentalRequest(request.id);
              Alert.alert('Success', 'Rental request cancelled successfully.');
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to cancel request';
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (request: EquipmentRentalRequest) => {
    // Navigate to request details screen
    router.push({
      pathname: '/dashboard/tabs/machineRent/requestDetails',
      params: { requestId: request.id.toString() }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-blue-500';
      case 'rejected':
        return 'bg-red-500';
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'returned':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'returned':
        return 'Returned';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}.00`;
  };

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#000" />
      <Text className="text-base text-black mt-4">Loading rental requests...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <MaterialIcons name="error-outline" size={64} color="#ef4444" />
      <Text className="text-lg font-bold text-black text-center mt-4 mb-2">
        Failed to Load Requests
      </Text>
      <Text className="text-base text-black text-center mb-6 leading-6">
        {rentalRequestsError || 'Unable to load rental requests. Please check your internet connection and try again.'}
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
    <View className="flex-1 items-center justify-center py-20 px-6">
      <MaterialIcons name="receipt-long" size={64} color="#9ca3af" />
      <Text className="text-lg font-bold text-black text-center mt-4 mb-2">
        No Rental Requests
      </Text>
      <Text className="text-base text-black text-center leading-6 mb-8">
        You haven't made any rental requests yet. Start by browsing available equipment and making your first rental request.
      </Text>
      <CustomButton
        title="Browse Equipment"
        onPress={() => router.push('/dashboard/tabs/machineRent')}
        variant="primary"
        size="large"
        fullWidth={true}
      />
    </View>
  );

  const renderRentalRequestCard = (request: EquipmentRentalRequest) => (
    <View
      key={request.id}
      className="mb-4 p-4 rounded-lg bg-white border border-gray-200"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header with Status */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-black">
          {request.equipment_name}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
          <Text className="text-xs font-semibold text-white">
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>

      {/* Request Details */}
      <View className="space-y-2 mb-4">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Rental Period:</Text>
          <Text className="text-sm text-black font-medium">
            {formatDate(request.start_date)} - {formatDate(request.end_date)}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Duration:</Text>
          <Text className="text-sm text-black font-medium">
            {request.rental_duration} day{request.rental_duration !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Total Amount:</Text>
          <Text className="text-sm text-black font-medium">
            {formatCurrency(request.total_amount)}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Delivery Address:</Text>
          <Text className="text-sm text-black font-medium flex-1 text-right ml-2">
            {request.delivery_address}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <CustomButton
          title="View Details"
          onPress={() => handleViewDetails(request)}
          variant="primary"
          size="small"
          fullWidth={false}
        />
        
        {request.status === 'pending' && (
          <CustomButton
            title="Cancel"
            onPress={() => handleCancelRequest(request)}
            variant="secondary"
            size="small"
            fullWidth={false}
          />
        )}
      </View>

      {/* Additional Info for Different Statuses */}
      {request.status === 'rejected' && request.rejection_reason && (
        <View className="mt-3 p-3 bg-red-50 rounded-lg">
          <Text className="text-sm text-red-800">
            <Text className="font-semibold">Rejection Reason:</Text> {request.rejection_reason}
          </Text>
        </View>
      )}

      {request.status === 'approved' && request.pickup_qr_code_url && (
        <View className="mt-3 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800">
            <Text className="font-semibold">Pickup QR Code:</Text> Available
          </Text>
        </View>
      )}

      {request.status === 'active' && request.return_qr_code_url && (
        <View className="mt-3 p-3 bg-green-50 rounded-lg">
          <Text className="text-sm text-green-800">
            <Text className="font-semibold">Return QR Code:</Text> Available
          </Text>
        </View>
      )}
    </View>
  );

  // Load rental requests on mount
  useEffect(() => {
    fetchMyRentalRequests();
  }, [fetchMyRentalRequests]);

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
              My Rental Requests
            </Text>
          </View>

          {/* Introductory Text */}
          <Text className="text-base text-black text-left leading-6 mb-6">
            Track the status of your equipment rental requests and manage your bookings.
          </Text>
        </View>

        {/* Rental Requests List */}
        <ScrollView 
          className="flex-1 px-6 pb-8" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {rentalRequestsLoading ? (
            renderLoadingState()
          ) : rentalRequestsError ? (
            renderErrorState()
          ) : !rentalRequests || rentalRequests.length === 0 ? (
            renderEmptyState()
          ) : (
            rentalRequests.map(renderRentalRequestCard)
          )}
        </ScrollView>
      </View>
    </>
  );
}
