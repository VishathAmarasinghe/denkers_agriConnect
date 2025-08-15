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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
interface DayObject {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
  isToday?: boolean;
}

export default function DateTimePicker() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Anuradhapura Office - 2');
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  // Get current date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
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

  const handleMobileConfirm = () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Please enter your mobile number');
      return;
    }
    
    // Validate mobile number (basic validation)
    if (mobileNumber.length < 10) {
      Alert.alert('Please enter a valid mobile number');
      return;
    }

    // Close modal and navigate to next screen
    setShowMobileModal(false);
    router.push('/dashboard/tabs/soilManagement/RequestSuccess')
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

  const days = getDaysInMonth(currentMonth);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Schedule Your Soil Testing Service</Text>
          <Text style={styles.subtitle}>
            Pick the most convenient date and time slot for your soil sample collection.
          </Text>
        </View>

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

        {/* Selection Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected Location -</Text>
            <Text style={styles.summaryValue}>{selectedLocation}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected Date -</Text>
            <Text style={styles.summaryValue}>
              {selectedDate ? formatDate(selectedDate) : 'Not selected'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
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
            />
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleMobileConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={handleMobileCancel}
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