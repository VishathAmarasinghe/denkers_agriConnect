import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LocationSelection() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  // Clear selection on component mount (refresh)
  useFocusEffect(
    useCallback(() => {
      setSelectedLocation(null);
    }, [])
  );

  const locations = [
    {
      id: 1,
      name: 'Anuradhapura Office - 1',
      address: 'No. 19 Thornridge Cir. Shiloh, Anuradhapura.',
      contact: 'Contact - 076 985 3423',
      image: require('../../../../assets/images/office1.jpg'), 
    },
    {
      id: 2,
      name: 'Anuradhapura Office - 2',
      address: 'No. 19 Thornridge Cir. Shiloh, Anuradhapura.',
      contact: 'Contact - 076 985 3423',
      image: require('../../../../assets/images/office2.jpg'), // Replace with actual image path
    },
    {
      id: 3,
      name: 'Anuradhapura Office - 3',
      address: 'No. 19 Thornridge Cir. Shiloh, Anuradhapura.',
      contact: 'Contact - 076 985 3423',
      image: require('../../../../assets/images/office3.jpg'), // Replace with actual image path
    },
    {
      id: 4,
      name: 'Anuradhapura Office - 4',
      address: 'No. 19 Thornridge Cir. Shiloh, Anuradhapura.',
      contact: 'Contact - 076 985 3423',
      image: require('../../../../assets/images/office4.jpg'), // Replace with actual image path
    },
  ];

  const handleLocationSelect = (locationId: number) => {
    console.log(`Selected Location ID: ${locationId}`);
    setSelectedLocation(locationId);
  };

  const handleBack = () => {
    router.push('/dashboard/tabs/soilManagement');
  };

  const handlePickDate = () => {
    if (!selectedLocation) {
      Alert.alert('Please select a location first');
      return;
    }
    // Navigate to date picker or next screen
    router.push('/dashboard/tabs/soilManagement/datePicker');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Select Your Sample Collection Center</Text>
          <Text style={styles.subtitle}>
            Choose the most convenient location for soil sample collection.
          </Text>
        </View>

        <View style={styles.locationList}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationCard,
                selectedLocation === location.id && styles.selectedCard
              ]}
              onPress={() => handleLocationSelect(location.id)}
            >
              <View style={styles.locationContent}>
                <Image
                  source={location.image}
                  style={styles.locationImage}
                  defaultSource={require('../../../../assets/images/placeholder.jpg')} // Fallback image
                />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                  <Text style={styles.locationContact}>{location.contact}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.pickDateButton,
            !selectedLocation && styles.disabledButton
          ]} 
          onPress={handlePickDate}
          disabled={!selectedLocation}
        >
          <Text style={styles.pickDateButtonText}>Pick a Date</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
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
  locationList: {
    paddingBottom: 100,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#6BCF7F',
    backgroundColor: '#f8fff9',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationContact: {
    fontSize: 14,
    color: '#666',
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
  pickDateButton: {
    backgroundColor: '#6BCF7F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  pickDateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 4,
  },
});