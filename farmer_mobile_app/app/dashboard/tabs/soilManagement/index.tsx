import { 
  ImageBackground, 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SoilManagementScreen() {
  // Handler functions for button actions
  const handleRequestService = () => {
    // Navigate to service request screen
    router.push('/dashboard/tabs/soilManagement/serviceRequest');
  };

  const handleLabReports = () => {
    router.push('/dashboard/tabs/soilManagement/TestReports')
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ImageBackground
        source={require('../../../../assets/images/soil_management_bg.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
         <View style={styles.overlay} />
        
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Know Your Soil</Text>
            <Text style={styles.subtitle}>Grow Better Crops</Text>
          </View>
          
          <Text style={styles.description}>
            Expert soil testing with personalized recommendations for your farm!
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleRequestService}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Request Service</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleLabReports}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Lab Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 300,
    margin: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#52B788',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#52B788',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#52B788',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#52B788',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});