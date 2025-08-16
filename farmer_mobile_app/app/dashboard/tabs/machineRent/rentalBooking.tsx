import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import CustomButton from '@/components/CustomButton';
import { useMachineRental } from '@/hooks/useMachineRental';
import { Equipment, CreateRentalRequestData } from '@/utils/machineRentalService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function RentalBookingScreen() {
  const { machineId, categoryId, machineData } = useLocalSearchParams<{ 
    machineId: string; 
    categoryId: string; 
    machineData: string;
  }>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: '',
    additionalNotes: ''
  });

  const {
    fetchEquipmentById,
    checkAvailability,
    createRentalRequest,
    availability,
    availabilityLoading,
    availabilityError
  } = useMachineRental();

  const [machine, setMachine] = useState<Equipment | null>(null);
  const [machineLoading, setMachineLoading] = useState(true);
  const [machineError, setMachineError] = useState<string | null>(null);

  // Calculate rental fees - always call this hook
  const rentalFees = useMemo(() => {
    if (selectedDates.length === 0 || !machine) {
      return { machineFee: 0, deliveryFee: 0, totalFee: 0 };
    }
    
    // Convert string values to integers for calculations
    const dailyRate = parseInt(String(machine.daily_rate || '0').replace('.00', ''));
    const deliveryFee = parseInt(String(machine.delivery_fee || '0').replace('.00', ''));
    
    // Calculate actual rental days (for single day, it's still 1 day)
    const actualRentalDays = selectedDates.length;
    
    const machineFee = actualRentalDays * dailyRate;
    const totalFee = machineFee + deliveryFee;
    
    return { machineFee, deliveryFee, totalFee };
  }, [selectedDates, machine]);

  const handleBack = () => {
    router.back();
  };

  const handleRentMachine = () => {
    setShowDetailsForm(true);
  };

  const handleCancelRental = () => {
    setShowDetailsForm(false);
    setFormData({ name: '', location: '', contactNumber: '', additionalNotes: '' });
  };

  const handleConfirmRental = async () => {
    // Validate form data
    if (!formData.name.trim() || !formData.location.trim() || !formData.contactNumber.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (selectedDates.length === 0) {
      Alert.alert('Validation Error', 'Please select rental dates.');
      return;
    }

    if (!machine) {
      Alert.alert('Error', 'Machine information not available.');
      return;
    }
    
    // Check authentication token
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Auth token available:', !!token);
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again to continue.');
        return;
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
      Alert.alert('Authentication Error', 'Unable to verify authentication. Please log in again.');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Prepare rental request data
      const startDate = new Date(Math.min(...selectedDates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...selectedDates.map(d => d.getTime())));
      
      // For single-day rentals, set end date to next day to satisfy backend validation
      // The backend requires end_date to be after start_date
      if (startDate.getTime() === endDate.getTime()) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      // Convert monetary values to integers for backend compatibility
      const dailyRate = parseInt(String(machine.daily_rate || '0').replace('.00', ''));
      const deliveryFee = parseInt(String(machine.delivery_fee || '0').replace('.00', ''));
      const securityDeposit = parseInt(String(machine.security_deposit || '0').replace('.00', ''));
      
      const rentalRequestData: CreateRentalRequestData = {
        equipment_id: machine.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        receiver_name: formData.name.trim(),
        receiver_phone: formData.contactNumber.trim(),
        delivery_address: formData.location.trim(),
        ...(formData.additionalNotes.trim() && { additional_notes: formData.additionalNotes.trim() })
      };

      console.log('Machine object:', machine);
      console.log('Machine ID type:', typeof machine.id, 'Value:', machine.id);
      console.log('Selected dates:', selectedDates);
      console.log('Start date:', startDate.toISOString().split('T')[0], 'Type:', typeof startDate.toISOString().split('T')[0]);
      console.log('End date:', endDate.toISOString().split('T')[0], 'Type:', typeof endDate.toISOString().split('T')[0]);
      console.log('Form data:', formData);
      console.log('Receiver name type:', typeof formData.name.trim(), 'Value:', formData.name.trim());
      console.log('Receiver phone type:', typeof formData.contactNumber.trim(), 'Value:', formData.contactNumber.trim());
      console.log('Delivery address type:', typeof formData.location.trim(), 'Value:', formData.location.trim());
      console.log('Rental request data being sent:', rentalRequestData);
      console.log('Data types:', {
        equipment_id: typeof rentalRequestData.equipment_id,
        start_date: typeof rentalRequestData.start_date,
        end_date: typeof rentalRequestData.end_date,
        receiver_name: typeof rentalRequestData.receiver_name,
        receiver_phone: typeof rentalRequestData.receiver_phone,
        delivery_address: typeof rentalRequestData.delivery_address,
        additional_notes: typeof rentalRequestData.additional_notes
      });

      // Submit rental request
      await createRentalRequest(rentalRequestData);
      
      // Hide loading and show confirmation screen
      setIsLoading(false);
      setShowDetailsForm(false);
      setShowConfirmation(true);
    } catch (error) {
      setIsLoading(false);
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = 'Failed to create rental request';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract more detailed error information
        const errorObj = error as any;
        if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Load machine details
  const loadMachineDetails = async () => {
    if (!machineId) return;
    
    try {
      setMachineLoading(true);
      setMachineError(null);
      
      // First try to use the passed machine data
      if (machineData) {
        try {
          const parsedMachine = JSON.parse(machineData);
          setMachine(parsedMachine);
          setMachineLoading(false);
          return; // Use passed data, skip API call
        } catch (parseError) {
          console.warn('Failed to parse machine data from params, falling back to API call');
        }
      }
      
      // Fallback to API call if no machine data or parsing failed
      const equipment = await fetchEquipmentById(parseInt(machineId));
      if (equipment != null) {
        setMachine(equipment);
      } else {
        setMachineError('Machine not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load machine details';
      setMachineError(errorMessage);
    } finally {
      setMachineLoading(false);
    }
  };

  // Check availability for the current month
  const checkAvailabilityForMonth = async () => {
    if (!machine) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    console.log('Checking availability for month:', {
      machineId: machine.id,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });
    
    await checkAvailability(
      machine.id,
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    );
    
    console.log('Availability data received:', availability);
  };

  // Load machine details on mount
  useEffect(() => {
    console.log('RentalBooking - machineId:', machineId);
    console.log('RentalBooking - machineData:', machineData);
    loadMachineDetails();
  }, [machineId]);

  // Check availability when machine loads
  useEffect(() => {
    if (machine && !machineLoading) {
      checkAvailabilityForMonth();
    }
  }, [machine, machineLoading]);

  // Check availability when month changes
  useEffect(() => {
    if (machine) {
      checkAvailabilityForMonth();
    }
  }, [currentMonth, machine]);

  // Check availability when dates change
  const checkAvailabilityForDates = async () => {
    if (!machine || selectedDates.length === 0) return;
    
    const startDate = new Date(Math.min(...selectedDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...selectedDates.map(d => d.getTime())));
    
    await checkAvailability(
      machine.id,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  // Check availability when dates are selected
  useEffect(() => {
    if (selectedDates.length > 0 && machine) {
      checkAvailabilityForDates();
    }
  }, [selectedDates, machine]);

  if (machineLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-lg text-gray-600 mt-4">Loading machine details...</Text>
      </View>
    );
  }

  if (machineError || !machine) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-lg font-bold text-black text-center mt-4 mb-2">
          Failed to Load Machine
        </Text>
        <Text className="text-base text-black text-center mb-6 leading-6">
          {machineError || 'Unable to load machine details. Please check your internet connection and try again.'}
        </Text>
        <TouchableOpacity
          className="bg-black px-6 py-3 rounded-lg"
          onPress={loadMachineDetails}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateUnavailable = (date: Date) => {
    if (!availability) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return availability.unavailable_dates.includes(dateStr);
  };

  // Get reason why date is unavailable
  const getUnavailableReason = (date: Date) => {
    if (!availability || !availability.unavailable_reasons) return '';
    
    const dateStr = date.toISOString().split('T')[0];
    return availability.unavailable_reasons[dateStr] || '';
  };

  const isCurrentDate = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => 
      selectedDate.getDate() === date.getDate() && 
      selectedDate.getMonth() === date.getMonth() && 
      selectedDate.getFullYear() === date.getFullYear()
    );
  };

  const handleDatePress = (date: Date) => {
    if (isDateDisabled(date) || isDateUnavailable(date)) return;

    const dateStr = date.toDateString();
    const isAlreadySelected = selectedDates.some(d => d.toDateString() === dateStr);
    
    if (isAlreadySelected) {
      // Remove this date and any dates that would create gaps
      const newSelectedDates = selectedDates.filter(d => d.toDateString() !== dateStr);
      
      // If removing this date creates a gap, we need to find the largest continuous range
      if (newSelectedDates.length > 0) {
        const sortedDates = [...newSelectedDates].sort((a, b) => a.getTime() - b.getTime());
        const continuousRanges = [];
        let currentRange = [sortedDates[0]];
        
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = sortedDates[i];
          const prevDate = sortedDates[i - 1];
          const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            // Consecutive date, add to current range
            currentRange.push(currentDate);
          } else {
            // Gap found, save current range and start new one
            continuousRanges.push([...currentRange]);
            currentRange = [currentDate];
          }
        }
        continuousRanges.push(currentRange);
        
        // Find the largest continuous range
        const largestRange = continuousRanges.reduce((largest, current) => 
          current.length > largest.length ? current : largest
        );
        
        setSelectedDates(largestRange);
      } else {
        setSelectedDates([]);
      }
    } else {
      // Add this date and fill any gaps
      const allDates = [...selectedDates, date];
      const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
      
      // Fill gaps between selected dates
      const filledDates = [];
      for (let i = 0; i < sortedDates.length; i++) {
        filledDates.push(sortedDates[i]);
        
        if (i < sortedDates.length - 1) {
          const currentDate = sortedDates[i];
          const nextDate = sortedDates[i + 1];
          const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
          
          // Fill gaps by adding intermediate dates
          for (let day = 1; day < dayDiff; day++) {
            const intermediateDate = new Date(currentDate);
            intermediateDate.setDate(currentDate.getDate() + day);
            
            // Only add if the intermediate date is available and not disabled
            if (!isDateDisabled(intermediateDate) && !isDateUnavailable(intermediateDate)) {
              filledDates.push(intermediateDate);
            }
          }
        }
      }
      
      // Sort and remove duplicates
      const uniqueDates = filledDates
        .sort((a, b) => a.getTime() - b.getTime())
        .filter((date, index, array) => 
          index === 0 || date.getTime() !== array[index - 1].getTime()
        );
      
      setSelectedDates(uniqueDates);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const unavailable = isDateUnavailable(date);
      const current = isCurrentDate(date);
      const selected = isDateSelected(date);
      
      let dayStyle = 'w-10 h-10 rounded-full items-center justify-center';
      let textStyle = 'text-base';
      
      if (disabled) {
        dayStyle += ' bg-gray-100';
        textStyle += ' text-gray-400';
      } else if (unavailable) {
        dayStyle += ' bg-red-100';
        textStyle += ' text-red-500';
      } else if (selected) {
        dayStyle += ' bg-green-500';
        textStyle += ' text-white font-semibold';
      } else if (current) {
        dayStyle += ' border-2 border-black';
        textStyle += ' text-black font-semibold';
      } else {
        dayStyle += ' bg-white';
        textStyle += ' text-black';
      }
      
      days.push(
        <TouchableOpacity
          key={day}
          className={dayStyle}
          onPress={() => handleDatePress(date)}
          disabled={disabled || unavailable}
        >
          <Text className={textStyle}>{day}</Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return '';
    
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];
    
    if (startDate.getTime() === endDate.getTime()) {
      return `${startDate.getDate()} ${formatMonthYear(startDate).split(' ')[0]} ${startDate.getFullYear()}`;
    } else {
      return `${startDate.getDate()} - ${endDate.getDate()} ${formatMonthYear(startDate).split(' ')[0]} ${startDate.getFullYear()}`;
    }
  };

  const getDetailedDateInfo = () => {
    if (selectedDates.length === 0) return null;
    
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];
    
    // Calculate the full date range (including gaps)
    const fullRangeStart = new Date(startDate);
    const fullRangeEnd = new Date(endDate);
    const fullRangeDates: string[] = [];
    
    for (let d = new Date(fullRangeStart); d <= fullRangeEnd; d.setDate(d.getDate() + 1)) {
      fullRangeDates.push(d.toISOString().split('T')[0]);
    }
    
    // Find gaps (dates that should be in range but aren't selected)
    const selectedDateStrings = selectedDates.map(d => d.toISOString().split('T')[0]);
    const gaps = fullRangeDates.filter(date => !selectedDateStrings.includes(date));
    
    // Find unavailable dates in the gaps
    const unavailableInGaps = gaps.filter(date => {
      if (!availability?.unavailable_dates) return false;
      return availability.unavailable_dates.includes(date);
    });
    
    return {
      totalSelected: selectedDates.length,
      fullRange: fullRangeDates.length,
      gaps: gaps.length,
      unavailableInGaps,
      hasGaps: gaps.length > 0
    };
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
          {/* Check Availability & Book Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-2">
              Check Availability & Book
            </Text>
            <Text className="text-base text-gray-700 mb-6">
              Select dates when you need this equipment for your farm.
            </Text>

            {/* Calendar */}
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              {/* Month Navigation */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                  onPress={() => navigateMonth('prev')}
                >
                  <MaterialIcons name="chevron-left" size={20} color="#666" />
                </TouchableOpacity>
                
                <Text className="text-lg font-semibold text-black">
                  {formatMonthYear(currentMonth)}
                </Text>
                
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                  onPress={() => navigateMonth('next')}
                >
                  <MaterialIcons name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Days of Week */}
              <View className="flex-row justify-between mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} className="text-sm font-bold text-black w-10 text-center">
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View className="flex-row flex-wrap justify-between">
                {renderCalendar()}
              </View>

              {/* Availability Status */}
              {availabilityLoading && (
                <View className="mt-4 items-center">
                  <ActivityIndicator size="small" color="#000" />
                  <Text className="text-sm text-gray-600 mt-2">Checking availability...</Text>
                </View>
              )}

              {availabilityError && (
                <View className="mt-4 p-3 bg-red-50 rounded-lg">
                  <Text className="text-sm text-red-600 text-center">
                    {availabilityError}
                  </Text>
                </View>
              )}

              {/* Calendar Legend */}
              <View className="mt-4 flex-row justify-center space-x-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-1" />
                  <Text className="text-xs text-gray-600">Available</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-red-100 mr-1" />
                  <Text className="text-xs text-red-600">Booked</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-gray-100 mr-1" />
                  <Text className="text-xs text-gray-400">Past</Text>
                </View>
              </View>
            </View>

            {/* Selected Dates Summary */}
            {selectedDates.length > 0 && (
              <View className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
                <Text className="text-base font-bold text-black mb-1">
                  Selected Machine - {machine.name}
                </Text>
                <Text className="text-base font-bold text-black">
                  Selected Dates - {formatSelectedDates()}
                </Text>
                
                {/* Detailed Date Information */}
                {(() => {
                  const dateInfo = getDetailedDateInfo();
                  if (!dateInfo) return null;
                  
                  return (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      {/* Total Days Info */}
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm text-gray-600">Total Selected Days:</Text>
                        <Text className="text-sm font-semibold text-black">{dateInfo.totalSelected} days</Text>
                      </View>
                      
                      {/* Gap Information */}
                      {dateInfo.hasGaps && (
                        <View className="mb-2">
                          <Text className="text-sm text-gray-600">Date Range:</Text>
                          <Text className="text-sm font-semibold text-black">
                            {dateInfo.fullRange} days ({dateInfo.gaps} unavailable)
                          </Text>
                        </View>
                      )}
                      
                      {/* Unavailable Dates in Gaps */}
                      {dateInfo.unavailableInGaps.length > 0 && (
                        <View className="mb-2">
                          <Text className="text-sm text-gray-600">Unavailable Dates:</Text>
                          <Text className="text-sm font-semibold text-red-600">
                            {dateInfo.unavailableInGaps.map(date => {
                              const d = new Date(date);
                              return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
                            }).join(', ')}
                          </Text>
                        </View>
                      )}
                      
                      {/* Gap Warning */}
                      {dateInfo.hasGaps && (
                        <View className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Text className="text-xs text-yellow-700 text-center">
                            ⚠️ Some dates in your selected range are unavailable and have been automatically skipped
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })()}
              </View>
            )}
          </View>

          {/* Rental Fees Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-2">
              Rental Fees
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              Transparent pricing for your selected machinery. View the total cost including delivery and optional services.
            </Text>

            <View className="bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base text-black">
                  Machine Fee ({selectedDates.length} Days)
                </Text>
                <Text className="text-base font-semibold text-black">
                  Rs. {(rentalFees.machineFee || 0).toLocaleString()}
                </Text>
              </View>
              
              {/* Detailed Day Count Info */}
              {(() => {
                const dateInfo = getDetailedDateInfo();
                if (!dateInfo || !dateInfo.hasGaps) return null;
                
                return (
                  <View className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Text className="text-xs text-blue-700 text-center">
                      💡 You're paying for {dateInfo.totalSelected} available days out of {dateInfo.fullRange} total days in your range
                </Text>
              </View>
                );
              })()}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-600">Delivery Fee</Text>
                <Text className="text-base font-semibold text-black">
                  Rs. {(rentalFees.deliveryFee || 0).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-semibold text-gray-800">Total Rental Fee</Text>
                  <Text className="text-lg font-bold text-black">
                  Rs. {(rentalFees.totalFee || 0).toLocaleString()}
                  </Text>
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
            disabled={selectedDates.length === 0}
          />
        </View>

                                                                       {/* Provide Your Details Form Overlay */}
           {showDetailsForm && (
             <View className="absolute inset-0 justify-end">
               {/* Semi-transparent overlay to dim background */}
               <View className="absolute inset-0 bg-black opacity-30" />
               <View className="bg-white rounded-t-[40px] p-6 pb-8">
              <Text className="text-2xl font-bold text-black text-center mb-6">
                Provide Your Details
              </Text>
              
              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-black mb-2">Name *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Location Input */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-black mb-2">Location *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Enter Accurate Location of Your Land"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              {/* Contact Number Input */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-black mb-2">Contact Number *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Enter Your Phone Number"
                  value={formData.contactNumber}
                  onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Additional Notes Input */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-2">Additional Notes (Optional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Any special requirements or notes"
                  value={formData.additionalNotes}
                  onChangeText={(text) => setFormData({ ...formData, additionalNotes: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action Buttons */}
              <View className="space-y-4">
                                 <CustomButton
                   title={isLoading ? "Processing..." : "Rent Machine"}
                   onPress={handleConfirmRental}
                   variant="primary"
                   size="large"
                   fullWidth={true}
                   loading={isLoading}
                   disabled={isLoading}
                 /> 
                
                {/* Separator */}
                <View className="flex-row items-center">
                  <Text className="mx-4 text-sm text-gray-500"></Text>
                </View>
                
                <CustomButton
                  title="Cancel"
                  onPress={handleCancelRental}
                  variant="outline"
                  size="large"
                  fullWidth={true}
                />
              </View>
            </View>
          </View>
                 )}

         {/* Confirmation Screen Overlay */}
         {showConfirmation && (
           <View className="absolute inset-0 bg-white">
             {/* Header */}
             <View className="pt-16 px-6 pb-4 bg-white">
               <View className="flex-row items-center justify-between mb-6">
                 <View className="w-12 h-12" />
                 <Text className="text-2xl font-bold text-black flex-1 text-center">
                   Success!
                 </Text>
                 <View className="w-12 h-12" />
               </View>
             </View>

             {/* Content */}
             <View className="flex-1 px-6 items-center justify-center">
               {/* Checkmark Icon */}
               <View className="w-24 h-24 rounded-full border-4 border-black items-center justify-center mb-8">
                 <MaterialIcons name="check" size={48} color="black" />
               </View>

               {/* Success Message */}
               <Text className="text-2xl font-bold text-black text-center mb-4">
                 Rental Request Submitted Successfully!
               </Text>

               {/* Description */}
               <Text className="text-base text-black text-center leading-6 mb-12 px-4">
                 Your machine rental request has been successfully submitted! Our team will review your requirements and contact you within 24 hours to confirm availability, pricing, and delivery details.
               </Text>

               {/* Finish Button */}
               <CustomButton
                 title="Finish"
                 onPress={() => {
                   setShowConfirmation(false);
                   router.back();
                 }}
                 variant="primary"
                 size="large"
                 fullWidth={true}
               />
             </View>
           </View>
         )}
       </View>
     </>
   );
 }
