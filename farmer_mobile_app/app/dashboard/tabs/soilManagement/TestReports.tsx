import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TestReports() {
  const handleBack = () => {
    router.push('/dashboard/tabs/soilManagement');
  };

  const handleDownloadReport = (reportId: number) => {
    // Handle PDF download logic here
    console.log(`Downloading report ${reportId}`);
  };

  const handleViewReport = (reportId: number) => {
    // Navigate to detailed report view with report ID
    router.push(`/dashboard/tabs/soilManagement/DetailedTestReport?reportId=${reportId}`);
  };

  // Sample test reports data
  const testReports = [
    {
      id: 1,
      sendDate: '05 August 2025',
      rating: null,
      status: 'received',
      statusText: 'Sample Received',
      statusColor: '#6BCF7F',
    },
    {
      id: 2,
      sendDate: '12 June 2025',
      rating: null,
      status: 'processing',
      statusText: 'Processing',
      statusColor: '#f39c12',
    },
    {
      id: 3,
      sendDate: '31 March 2025',
      rating: 4,
      status: 'ready',
      statusText: 'Report Ready',
      statusColor: '#6BCF7F',
    },
    {
      id: 4,
      sendDate: '31 March 2025',
      rating: 3,
      status: 'ready',
      statusText: 'Report Ready',
      statusColor: '#6BCF7F',
    },
    {
      id: 5,
      sendDate: '31 March 2025',
      rating: 3,
      status: 'ready',
      statusText: 'Report Ready',
      statusColor: '#6BCF7F',
    },
    {
      id: 6,
      sendDate: '31 March 2025',
      rating: 1,
      status: 'ready',
      statusText: 'Report Ready',
      statusColor: '#6BCF7F',
    },
  ];

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= fullStars ? "star" : "star-outline"}
          size={16}
          color="#ffd700"
          style={styles.star}
        />
      );
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderStatusDot = (status: string, color: string) => {
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color: color }]}>{status}</Text>
      </View>
    );
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
        <Text style={styles.headerTitle}>Test Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Your Soil Test Reports</Text>
          <Text style={styles.sectionDescription}>
            Access all your test reports in one place. View detailed analysis, download PDF reports, and track improvements in your soil health over time.
          </Text>
        </View>

        <ScrollView 
          style={styles.reportsList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reportsContainer}
        >
          {testReports.map((report, index) => (
            <TouchableOpacity 
              key={report.id} 
              style={styles.reportCard}
              onPress={() => handleViewReport(report.id)}
              activeOpacity={0.7}
            >
              <View style={styles.reportContent}>
                <View style={styles.reportInfo}>
                  <Text style={styles.sendDate}>Send Date - {report.sendDate}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.overallRating}>
                      Overall Rating - {report.rating ? '' : 'Not Available'}
                    </Text>
                    {renderStars(report.rating)}
                  </View>
                </View>
                
                <View style={styles.statusSection}>
                  {renderStatusDot(report.statusText, report.statusColor)}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    backgroundColor: 'white',
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reportsList: {
    flex: 1,
  },
  reportsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  sendDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallRating: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});