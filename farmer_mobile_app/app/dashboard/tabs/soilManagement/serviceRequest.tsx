import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function LocationSelection() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [locations, setLocations] = useState<SoilCollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear selection on component mount (refresh)
  useFocusEffect(
    useCallback(() => {
      setSelectedLocation(null);
      fetchSoilCollectionCenters();
    }, [])
  );

  const fetchSoilCollectionCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API endpoint
      const response = await fetch('http://206.189.89.116:3000/api/v1/soil-collection-centers?page=1&limit=5');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        // Filter only active centers
        const activeCenters = data.data.filter(center => center.is_active === 1);
        setLocations(activeCenters);
      } else {
        throw new Error(data.message || 'Failed to fetch soil collection centers');
      }
    } catch (err) {
      console.error('Error fetching soil collection centers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load locations');
      Alert.alert('Error', 'Failed to load soil collection centers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    // Navigate to date picker with the selected location ID
    router.push(`/dashboard/tabs/soilManagement/datePicker?locationId=${selectedLocation}`);
  };

  const renderLocationCard = (location: SoilCollectionCenter) => (
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
          source={
            location.image_url 
              ? { uri: location.image_url }
              : require('../../../../assets/images/placeholder.jpg')
          }
          style={styles.locationImage}
          defaultSource={require('../../../../assets/images/placeholder.jpg')}
        />
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.locationAddress}>{location.address}</Text>
          <Text style={styles.locationContact}>
            Contact - {location.contact_number}
          </Text>
          {location.contact_person && (
            <Text style={styles.contactPerson}>
              Person: {location.contact_person}
            </Text>
          )}
          {location.operating_hours && (
            <Text style={styles.operatingHours}>
              Hours: {location.operating_hours}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Location</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6BCF7F" />
          <Text style={styles.loadingText}>Loading soil collection centers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchSoilCollectionCenters}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          {locations.length > 0 ? (
            locations.map(renderLocationCard)
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="location-outline" size={64} color="#ccc" />
              <Text style={styles.noDataText}>No soil collection centers available</Text>
            </View>
          )}
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
    alignItems: 'flex-start',
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
    marginBottom: 2,
  },
  contactPerson: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  operatingHours: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});