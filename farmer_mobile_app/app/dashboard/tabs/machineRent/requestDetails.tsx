import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import { useMachineRental } from '@/hooks/useMachineRental';
import { EquipmentRentalRequest } from '@/utils/machineRentalService';
import QRCode from 'react-native-qrcode-svg';

export default function RequestDetailsScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [request, setRequest] = useState<EquipmentRentalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<{ type: 'pickup' | 'return'; data: string } | null>(null);
  
  const {
    rentalRequests,
    rentalRequestsLoading,
    fetchMyRentalRequests,
    cancelRentalRequest
  } = useMachineRental();

  const handleBack = () => {
    router.back();
  };



  const handleCancelRequest = async () => {
    if (!request || request.status !== 'pending') {
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
              // Refresh the request details
              loadRequestDetails();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to cancel request';
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Would you like to contact our support team?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Contact Support',
          onPress: () => {
            // You can implement actual contact support functionality here
            Alert.alert('Support', 'Please call our support line: +1234567890');
          }
        }
      ]
    );
  };

  const generateQRCodeData = (request: EquipmentRentalRequest, type: 'pickup' | 'return') => {
    const qrData = {
      requestId: request.id,
      equipmentId: request.equipment_id,
      equipmentName: request.equipment_name,
      type: type,
      farmerId: request.farmer_id,
      receiverName: request.receiver_name,
      receiverPhone: request.receiver_phone,
      startDate: request.start_date,
      endDate: request.end_date,
      timestamp: new Date().toISOString(),
      // Add a unique identifier for security
      hash: `${request.id}-${request.equipment_id}-${type}-${Date.now()}`
    };
    
    return JSON.stringify(qrData);
  };

  const handleViewQRCode = (request: EquipmentRentalRequest, type: 'pickup' | 'return') => {
    const qrData = generateQRCodeData(request, type);
    setSelectedQrCode({ type, data: qrData });
    setQrModalVisible(true);
  };

  const loadRequestDetails = async () => {
    if (!requestId) {
      setError('Request ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Find the request from the existing rental requests
      if (rentalRequests && rentalRequests.length > 0) {
        const foundRequest = rentalRequests.find(r => r.id.toString() === requestId);
        if (foundRequest) {
          setRequest(foundRequest);
          setLoading(false);
          return;
        }
      }
      
      // If not found, show error
      setError(`Rental request #${requestId} not found. Please check your rental requests list.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load request details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your rental request is being reviewed by. We\'ll notify you once it\'s approved or rejected.';
      case 'approved':
        return 'Your rental request has been approved.';
      case 'rejected':
        return 'Your rental request was not approved. Please check the rejection reason below and contact support if needed.';
      case 'active':
        return 'Your rental is currently active.';
      case 'completed':
        return 'Your rental has been completed successfully. Thank you for using our service!';
      case 'returned':
        return 'The equipment has been returned and the rental is complete.';
      case 'cancelled':
        return 'This rental request has been cancelled.';
      default:
        return 'Status information not available.';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const calculateRentalPeriod = () => {
    if (!request) return { days: 0, hours: 0 };
    
    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { days: diffDays, hours: diffDays * 24 };
  };

  // Ensure rental requests are loaded if they're not already
  useEffect(() => {
    if (!rentalRequestsLoading && (!rentalRequests || rentalRequests.length === 0)) {
      fetchMyRentalRequests();
    }
  }, [rentalRequests, rentalRequestsLoading, fetchMyRentalRequests]);

  // Load request details when rental requests are available
  useEffect(() => {
    if (rentalRequests && rentalRequests.length > 0) {
      loadRequestDetails();
    }
  }, [rentalRequests, requestId]);

  if (loading || rentalRequestsLoading || !rentalRequests || rentalRequests.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-lg text-gray-600 mt-4">
          {rentalRequestsLoading ? 'Loading rental requests...' : 'Loading request details...'}
        </Text>
      </View>
    );
  }

  if (error && !request && !loading && !rentalRequestsLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-lg font-bold text-black text-center mt-4 mb-2">
          Request Not Found
        </Text>
        <Text className="text-base text-black text-center mb-6 leading-6">
          {error || 'The rental request you\'re looking for could not be found.'}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => router.push('/dashboard/tabs/machineRent/rentalRequests')}
        >
          <Text className="text-white font-semibold">Go to Rental Requests</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!request) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-lg text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  const rentalPeriod = calculateRentalPeriod();

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
              Request Details
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View className="mb-6">
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-black">Status</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
                  <Text className="text-xs font-semibold text-white">
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 leading-5">
                {getStatusDescription(request.status)}
              </Text>
            </View>
          </View>

          {/* Equipment Information */}
          <View className="mb-6">
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-lg font-bold text-black mb-3">Equipment Details</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Equipment Name:</Text>
                  <Text className="text-sm text-black font-medium flex-1 text-right ml-2">
                    {request.equipment_name}
                  </Text>
                </View>
                
                {request.category_name && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Category:</Text>
                    <Text className="text-sm text-black font-medium">
                      {request.category_name}
                    </Text>
                  </View>
                )}
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Request ID:</Text>
                  <Text className="text-sm text-black font-medium">
                    #{request.id}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Rental Period */}
          <View className="mb-6">
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-lg font-bold text-black mb-3">Rental Period</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Start Date:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatDate(request.start_date)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">End Date:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatDate(request.end_date)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Duration:</Text>
                  <Text className="text-sm text-black font-medium">
                    {rentalPeriod.days} day{rentalPeriod.days !== 1 ? 's' : ''} ({rentalPeriod.hours} hours)
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Requested On:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatDateTime(request.created_at)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Financial Details */}
          <View className="mb-6">
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-lg font-bold text-black mb-3">Financial Details</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Daily Rate:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatCurrency(request.total_amount / request.rental_duration)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Rental Fee ({request.rental_duration} days):</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatCurrency(request.total_amount - request.delivery_fee - request.security_deposit)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Delivery Fee:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatCurrency(request.delivery_fee)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Security Deposit:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatCurrency(request.security_deposit)}
                  </Text>
                </View>
                
                <View className="pt-2 border-t border-gray-200">
                  <View className="flex-row justify-between">
                    <Text className="text-base font-semibold text-black">Total Amount:</Text>
                    <Text className="text-lg font-bold text-black">
                      {formatCurrency(request.total_amount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Delivery Information */}
          <View className="mb-6">
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-lg font-bold text-black mb-3">Delivery Information</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Receiver Name:</Text>
                  <Text className="text-sm text-black font-medium">
                    {request.receiver_name}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Contact Number:</Text>
                  <Text className="text-sm text-black font-medium">
                    {request.receiver_phone}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Delivery Address:</Text>
                  <Text className="text-sm text-black font-medium flex-1 text-right ml-2">
                    {request.delivery_address}
                  </Text>
                </View>
                
                {request.additional_notes && (
                  <View className="pt-2 border-t border-gray-200">
                    <Text className="text-sm text-gray-600 mb-1">Additional Notes:</Text>
                    <Text className="text-sm text-black font-medium">
                      {request.additional_notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* QR Codes Section */}
            <View className="mb-6">
              <View className="bg-white rounded-lg p-4 border border-gray-200">
                <Text className="text-lg font-bold text-black mb-3">QR Codes</Text>
                
                <View className="space-y-3">
                                     <TouchableOpacity
                     className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                     onPress={() => handleViewQRCode(request, 'pickup')}
                   >
                     <View className="flex-row items-center">
                       <MaterialIcons name="qr-code" size={24} color="#2563eb" />
                       <Text className="text-sm font-medium text-blue-800 ml-2">Pickup QR Code</Text>
                     </View>
                     <MaterialIcons name="chevron-right" size={20} color="#2563eb" />
                   </TouchableOpacity>
                   
                   <TouchableOpacity
                     className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                     onPress={() => handleViewQRCode(request, 'return')}
                   >
                     <View className="flex-row items-center">
                       <MaterialIcons name="qr-code" size={24} color="#059669" />
                       <Text className="text-sm font-medium text-green-800 ml-2">Return QR Code</Text>
                     </View>
                     <MaterialIcons name="chevron-right" size={20} color="#059669" />
                   </TouchableOpacity>
                </View>
              </View>
            </View>

          {/* Admin Notes */}
          {request.admin_notes && (
            <View className="mb-6">
              <View className="bg-white rounded-lg p-4 border border-gray-200">
                <Text className="text-lg font-bold text-black mb-3">Admin Notes</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  {request.admin_notes}
                </Text>
              </View>
            </View>
          )}

          {/* Rejection Reason */}
          {request.status === 'rejected' && request.rejection_reason && (
            <View className="mb-6">
              <View className="bg-red-50 rounded-lg p-4 border border-red-200">
                <Text className="text-lg font-bold text-red-800 mb-3">Rejection Reason</Text>
                <Text className="text-sm text-red-700 leading-5">
                  {request.rejection_reason}
                </Text>
              </View>
            </View>
          )}

          {/* Timestamps */}
          <View className="mb-6">
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-lg font-bold text-black mb-3">Timeline</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Request Created:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatDateTime(request.created_at)}
                  </Text>
                </View>
                
                {request.approved_at && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Approved On:</Text>
                    <Text className="text-sm text-black font-medium">
                      {formatDateTime(request.approved_at)}
                    </Text>
                  </View>
                )}
                
                {request.pickup_confirmed_at && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Pickup Confirmed:</Text>
                    <Text className="text-sm text-black font-medium">
                      {formatDateTime(request.pickup_confirmed_at)}
                    </Text>
                  </View>
                )}
                
                {request.return_confirmed_at && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Return Confirmed:</Text>
                    <Text className="text-sm text-black font-medium">
                      {formatDateTime(request.return_confirmed_at)}
                    </Text>
                  </View>
                )}
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Last Updated:</Text>
                  <Text className="text-sm text-black font-medium">
                    {formatDateTime(request.updated_at)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-6 pb-8">
          <View className="space-y-3">
            {request.status === 'pending' && (
              <CustomButton
                title="Cancel Request"
                onPress={handleCancelRequest}
                variant="secondary"
                size="large"
                fullWidth={true}
              />
            )}
            
            <CustomButton
              title="Contact Support"
              onPress={handleContactSupport}
              variant="outline"
              size="large"
              fullWidth={true}
            />
          </View>
                 </View>
       </View>

       {/* QR Code Modal */}
       <Modal
         visible={qrModalVisible}
         transparent={true}
         animationType="fade"
         onRequestClose={() => setQrModalVisible(false)}
       >
         <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-6">
           <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
             {/* Header */}
             <View className="flex-row items-center justify-between mb-4">
               <Text className="text-xl font-bold text-black">
                 {selectedQrCode?.type === 'pickup' ? 'Pickup' : 'Return'} QR Code
               </Text>
               <TouchableOpacity
                 onPress={() => setQrModalVisible(false)}
                 className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
               >
                 <MaterialIcons name="close" size={20} color="#666" />
               </TouchableOpacity>
             </View>

             {/* QR Code */}
             {selectedQrCode && (
               <View className="items-center mb-4">
                 <View className="bg-white p-4 rounded-lg border-2 border-gray-200">
                   <QRCode
                     value={selectedQrCode.data}
                     size={200}
                     color="black"
                     backgroundColor="white"
                     ecl="M"
                   />
                 </View>
               </View>
             )}

             {/* QR Code Info */}
             <View className="mb-4">
               <Text className="text-sm text-gray-600 text-center mb-2">
                 Scan this QR code when {selectedQrCode?.type === 'pickup' ? 'collecting' : 'returning'} the equipment
               </Text>
               <Text className="text-xs text-gray-500 text-center">
                 Request ID: #{request?.id} | Equipment: {request?.equipment_name}
               </Text>
             </View>

             {/* Action Buttons */}
             <View className="space-y-3">
               <TouchableOpacity
                 className="bg-blue-500 py-3 rounded-lg"
                 onPress={() => setQrModalVisible(false)}
               >
                 <Text className="text-white font-semibold text-center">Close</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 className="bg-gray-200 py-3 rounded-lg"
                 onPress={() => {
                   // You can implement sharing functionality here
                   Alert.alert('Share QR Code', 'QR code sharing functionality can be implemented here.');
                 }}
               >
                 <Text className="text-gray-700 font-semibold text-center">Share QR Code</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
     </>
   );
 }
