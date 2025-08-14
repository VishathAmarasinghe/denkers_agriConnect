import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo } from 'react';
import CustomButton from '@/components/CustomButton';

const { width } = Dimensions.get('window');

interface MachineDetails {
  id: string;
  name: string;
  power: string;
  specs: string;
  dailyRate: number;
  deliveryFee: number;
  driverFee: number;
}

export default function RentalBookingScreen() {
  const { machineId, categoryId } = useLocalSearchParams<{ machineId: string; categoryId: string }>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: ''
  });

  const handleBack = () => {
    router.back();
  };

  const handleRentMachine = () => {
    setShowDetailsForm(true);
  };

  const handleCancelRental = () => {
    setShowDetailsForm(false);
    setFormData({ name: '', location: '', contactNumber: '' });
  };

  const handleConfirmRental = () => {
    // Validate form data
    if (!formData.name.trim() || !formData.location.trim() || !formData.contactNumber.trim()) {
      // Show error or alert
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Process rental confirmation
      console.log('Confirm rental for machine:', machineId, 'Dates:', selectedDates, 'Form:', formData);
      
      // Hide loading and show confirmation screen
      setIsLoading(false);
      setShowDetailsForm(false);
      setShowConfirmation(true);
    }, 2000); // 2 second delay to show loading
  };

  // Get machine details based on machineId and categoryId
  const getMachineDetails = (machineId: string, categoryId: string): MachineDetails | null => {
    const machines: Record<string, Record<string, MachineDetails>> = {
      '1': { // Tractors & Power Equipment
        '1': {
          id: '1',
          name: 'Mahindra 575 DI (75 HP)',
          power: '75 HP | 4WD | Diesel',
          specs: 'Power: 75 HP | 4WD | Diesel',
          dailyRate: 1200,
          deliveryFee: 2400,
          driverFee: 2500
        },
        '2': {
          id: '2',
          name: 'John Deere 5050D (50 HP)',
          power: '50 HP | 2WD | Diesel',
          specs: 'Power: 50 HP | 2WD | Diesel',
          dailyRate: 900,
          deliveryFee: 2000,
          driverFee: 2000
        },
        '3': {
          id: '3',
          name: 'New Holland 3630 (30 HP)',
          power: '30 HP | 2WD | Diesel',
          specs: 'Power: 30 HP | 2WD | Diesel',
          dailyRate: 700,
          deliveryFee: 1800,
          driverFee: 1800
        },
        '4': {
          id: '4',
          name: 'Kubota L2501 (25 HP)',
          power: '25 HP | 4WD | Diesel',
          specs: 'Power: 25 HP | 4WD | Diesel',
          dailyRate: 600,
          deliveryFee: 1500,
          driverFee: 1500
        }
      },
      '2': { // Harvesting Machines
        '1': {
          id: '1',
          name: 'Combine Harvester CX8070',
          power: '270 HP | 4WD | Diesel',
          specs: 'Power: 270 HP | 4WD | Diesel',
          dailyRate: 3500,
          deliveryFee: 5000,
          driverFee: 3500
        },
        '2': {
          id: '2',
          name: 'Grain Header 30ft',
          power: 'Attachable | 30ft Width',
          specs: 'Width: 30ft | Attachable',
          dailyRate: 800,
          deliveryFee: 2500,
          driverFee: 1500
        }
      },
      '3': { // Planting & Seeding Equipment
        '1': {
          id: '1',
          name: 'Planter 12 Row',
          power: '12 Row | Hydraulic',
          specs: 'Rows: 12 | Type: Hydraulic',
          dailyRate: 500,
          deliveryFee: 1200,
          driverFee: 1000
        },
        '2': {
          id: '2',
          name: 'Seed Drill 8 Row',
          power: '8 Row | Mechanical',
          specs: 'Rows: 8 | Type: Mechanical',
          dailyRate: 400,
          deliveryFee: 1000,
          driverFee: 800
        }
      },
      '4': { // Tillage & Cultivation
        '1': {
          id: '1',
          name: 'Disc Harrow 8ft',
          power: '8ft Width | Hydraulic',
          specs: 'Width: 8ft | Type: Hydraulic',
          dailyRate: 300,
          deliveryFee: 800,
          driverFee: 600
        },
        '2': {
          id: '2',
          name: 'Rotary Tiller 6ft',
          power: '6ft Width | PTO Driven',
          specs: 'Width: 6ft | Type: PTO Driven',
          dailyRate: 250,
          deliveryFee: 600,
          driverFee: 500
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
    // Example: August 13th is unavailable
    return date.getDate() === 13 && date.getMonth() === 7; // August is month 7 (0-indexed)
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

  // Calculate rental fees
  const rentalFees = useMemo(() => {
    if (selectedDates.length === 0) return { machineFee: 0, deliveryFee: 0, totalFee: 0 };
    
    const machineFee = selectedDates.length * machine.dailyRate;
    const deliveryFee = machine.deliveryFee;
    const totalFee = machineFee + deliveryFee;
    
    return { machineFee, deliveryFee, totalFee };
  }, [selectedDates, machine]);

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
                  Rs. {rentalFees.machineFee.toLocaleString()}.00
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base text-black">Delivery Fee</Text>
                <Text className="text-base font-semibold text-black">
                  Rs. {rentalFees.deliveryFee.toLocaleString()}.00
                </Text>
              </View>
              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-black">Total Fee</Text>
                  <Text className="text-lg font-bold text-black">
                    Rs. {rentalFees.totalFee.toLocaleString()}.00
                  </Text>
                </View>
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
                <Text className="text-base font-semibold text-black mb-2">Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Location Input */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-black mb-2">Location</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Enter Accurate Location of Your Land"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              {/* Contact Number Input */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-2">Contact Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Enter Your Phone Number"
                  value={formData.contactNumber}
                  onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Action Buttons */}
              <View className="space-y-4" >
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
