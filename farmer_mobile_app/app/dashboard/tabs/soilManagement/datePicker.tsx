import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoilCollectionCenter {
  id: number;
  name: string;
  location_id: number;
  address: string;
  contact_number: string;
  contact_person: string | null;
  description: string | null;
  image_url: string | null;
  latitude: string | null;
  longitude: string | null;
  place_id: string | null;
  operating_hours: string | null;
  services_offered: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: SoilCollectionCenter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface DayObject {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
  isToday?: boolean;
}

export default function DateTimePicker() {
  const { locationId } = useLocalSearchParams();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SoilCollectionCenter | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Get the usertoken from the local storage
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setUserToken(token);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    getToken();
  }, []);

  // Fetch location data when component mounts
  useEffect(() => {
    if (locationId) {
      fetchLocationData();
    } else {
      setError('No location selected');
      setLoading(false);
    }
  }, [locationId]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://206.189.89.116:3000/api/v1/soil-collection-centers?page=1&limit=5');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        // Find the selected location by ID
        const location = data.data.find(center => center.id === parseInt(locationId as string));
        
        if (location) {
          setSelectedLocation(location);
        } else {
          throw new Error('Selected location not found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch location data');
      }
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load location data');
      Alert.alert('Error', 'Failed to load location data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(year, month - 1, 0);
      const day = prevMonth.getDate() - startingDayOfWeek + i + 1;
      days.push({
        day,
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isPrevMonth: false,
        isToday: date.getTime() === today.getTime()
      });
    }

    // Add days from next month to complete the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (dayObj: DayObject) => {
    if (!dayObj.isCurrentMonth) return;
    
    // Don't allow selection of past dates
    if (dayObj.date < today) return;

    setSelectedDate(dayObj.date);
  };

  const handleSetDetails = () => {
    if (!selectedDate) {
      Alert.alert('Please select a date');
      return;
    }
    // Show mobile number popup
    setShowMobileModal(true);
  };

  const handleMobileConfirm = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Please enter your mobile number');
      return;
    }
    
    // Validate mobile number (basic validation)
    if (mobileNumber.length < 10) {
      Alert.alert('Please enter a valid mobile number');
      return;
    }

    if (!selectedDate || !selectedLocation) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    try {
      setSubmitting(true);

      // Format the date for the API
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Prepare the request data
      const requestData = {
        soil_collection_center_id: selectedLocation.id,
        preferred_date: formattedDate,
        preferred_time_slot: null, // You can add time slot selection later
        farmer_phone: mobileNumber.trim(),
        farmer_location_address: null, // You can add farmer location later
        farmer_latitude: null,
        farmer_longitude: null,
        additional_notes: null
      };

      console.log('usertoken:', requestData);

      // Make API call to create soil testing request
      const response = await fetch('http://206.189.89.116:3000/api/v1/soil-testing-scheduling/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Close modal and navigate to success screen
        setShowMobileModal(false);
        setMobileNumber('');
        router.push('/dashboard/tabs/soilManagement/RequestSuccess');
      } else {
        throw new Error(result.message || 'Failed to create soil testing request');
      }

    } catch (error) {
      console.error('Error creating soil testing request:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to submit request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMobileCancel = () => {
    setShowMobileModal(false);
    setMobileNumber('');
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setCurrentMonth(new Date());
    router.push('/dashboard/tabs/soilManagement');
  };

  const handleBack = () => {
    router.push('/dashboard/tabs/soilManagement/serviceRequest');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Date & Time</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6BCF7F" />
          <Text style={styles.loadingText}>Loading location details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !selectedLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Date & Time</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Location data not available'}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchLocationData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const days = getDaysInMonth(currentMonth);

  return (
    <SafeAreaView style={styles.container}>
      {/* ...existing header code... */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Schedule Your Soil Testing Service</Text>
            <Text style={styles.subtitle}>
              Pick the most convenient date and time slot for your soil sample collection.
            </Text>
        </View>

        {/* ...existing calendar code... */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Day Names Header */}
          <View style={styles.dayNamesRow}>
            {dayNames.map(day => (
              <Text key={day} style={styles.dayName}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((dayObj, index) => {
              const isSelected = selectedDate && 
                dayObj.date.getTime() === selectedDate.getTime();
              const isPastDate = dayObj.date < today;
              const isDisabled = !dayObj.isCurrentMonth || isPastDate;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    dayObj.isToday && styles.todayCell,
                    isDisabled && styles.disabledDay
                  ]}
                  onPress={() => handleDateSelect(dayObj)}
                  disabled={isDisabled}
                >
                  <Text style={[
                    styles.dayText,
                    !dayObj.isCurrentMonth && styles.otherMonthText,
                    isSelected && styles.selectedDayText,
                    dayObj.isToday && styles.todayText,
                    isPastDate && styles.pastDateText
                  ]}>
                    {dayObj.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Updated Selection Summary with actual location data */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected Location -</Text>
            <Text style={styles.summaryValue}>{selectedLocation.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Address -</Text>
            <Text style={styles.summaryValue}>{selectedLocation.address}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Contact -</Text>
            <Text style={styles.summaryValue}>{selectedLocation.contact_number}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected Date -</Text>
            <Text style={styles.summaryValue}>
              {selectedDate ? formatDate(selectedDate) : 'Not selected'}
            </Text>
          </View>
        </View>
        </ScrollView>

        {/* ...footer and modal code... */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.setDetailsButton,
              !selectedDate && styles.disabledButton
            ]} 
            onPress={handleSetDetails}
            disabled={!selectedDate}
          >
            <Text style={styles.setDetailsButtonText}>Set Your Details</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Mobile Number Modal */}
      <Modal
        visible={showMobileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleMobileCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Your Mobile Number</Text>
            
            <TextInput
              style={styles.mobileInput}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="077 546 5434"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={15}
              editable={!submitting}
            />
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                submitting && styles.disabledButton
              ]} 
              onPress={handleMobileConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.confirmButtonText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={handleMobileCancel}
              disabled={submitting}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingVertical: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedDay: {
    backgroundColor: '#6BCF7F',
  },
  todayCell: {
    backgroundColor: '#2c3e50',
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  otherMonthText: {
    color: '#ccc',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  todayText: {
    color: 'white',
    fontWeight: '600',
  },
  pastDateText: {
    color: '#ccc',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  setDetailsButton: {
    backgroundColor: '#6BCF7F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6BCF7F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  setDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 4,
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6BCF7F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  mobileInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#6BCF7F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6BCF7F',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});