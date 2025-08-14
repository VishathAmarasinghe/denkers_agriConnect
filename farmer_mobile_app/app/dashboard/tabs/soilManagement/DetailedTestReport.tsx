import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);


export default function DetailedTestReport() {
  const { reportId } = useLocalSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBack = () => {
    router.push('/dashboard/tabs/soilManagement/TestReports');
  };

  // Helper function to safely extract string from params
  const getReportId = (): string => {
    if (Array.isArray(reportId)) {
      return reportId[0] || 'RPT - 0032';
    }
    return reportId || 'RPT - 0032';
  };

  // Sample detailed report data - in real app, this would come from API based on reportId
  const reportDetails = {
    reportId: getReportId(),
    ownerName: 'Mr. Amal de Silva',
    sendDate: '31 March 2025',
    testerName: 'Mr. Kumara de Silva',
    testedDate: '22 April 2025',
    overallRating: 'Good',
    specialNote: 'No',
  };

  const handleDownloadReport = () => {
    // Show success modal immediately
    setShowSuccessModal(true);
    
    // Auto-hide modal after 3 seconds and stay on the same screen
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
    
    // Handle PDF download logic here (you can add actual download logic later)
    console.log('Report download started...');
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
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Report ID Section */}
          <DetailRow label="Report ID" value={reportDetails.reportId} />

          {/* Owner Details Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Owner Details</Text>
          </View>
          <DetailRow label="Name" value={reportDetails.ownerName} />
          <DetailRow label="Send Date" value={reportDetails.sendDate} />

          {/* Tester Details Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tester Details</Text>
          </View>
          <DetailRow label="Tested By" value={reportDetails.testerName} />
          <DetailRow label="Tested Date" value={reportDetails.testedDate} />
          <DetailRow label="Overall Rating" value={reportDetails.overallRating} />
          <DetailRow label="Special Note" value={reportDetails.specialNote} />
        </ScrollView>

        {/* Download Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={handleDownloadReport}
          >
            <Text style={styles.downloadButtonText}>Download Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={40} color="#6BCF7F" />
            </View>
            <Text style={styles.successText}>Your Report Has Been Downloaded!</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  detailValueContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  downloadButton: {
    backgroundColor: '#6BCF7F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6BCF7F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  downloadButtonText: {
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
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 40,
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#6BCF7F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
});