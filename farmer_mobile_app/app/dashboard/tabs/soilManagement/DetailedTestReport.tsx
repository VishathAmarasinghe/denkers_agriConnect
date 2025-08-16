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

interface SoilReport {
  id: number;
  soil_testing_id: number;
  farmer_id: number;
  soil_collection_center_id: number;
  field_officer_id: number;
  report_file_name: string;
  report_file_path: string;
  report_file_size: number;
  report_file_type: string;
  report_title: string;
  report_summary: string;
  soil_ph: string;
  soil_nitrogen: string;
  soil_phosphorus: string;
  soil_potassium: string;
  soil_organic_matter: string;
  soil_texture: string;
  recommendations: string;
  testing_date: string;
  report_date: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  farmer_name: string;
  center_name: string;
  field_officer_name: string;
}

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

export default function DetailedTestReport() {
  const { reportId, reportData } = useLocalSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBack = () => {
    router.push('/dashboard/tabs/soilManagement/TestReports');
  };

  // Parse the report data from params
  const getReportData = (): SoilReport | null => {
    try {
      if (reportData && typeof reportData === 'string') {
        return JSON.parse(decodeURIComponent(reportData));
      }
      return null;
    } catch (error) {
      console.error('Error parsing report data:', error);
      return null;
    }
  };

  const report = getReportData();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper function to get file size in readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadReport = () => {
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
    
    console.log('Report download started...', report?.report_file_path);
  };

  if (!report) {
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Report data not found</Text>
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
        <Text style={styles.headerTitle}>Test Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Report Basic Info */}
          <DetailRow label="Report Title" value={report.report_title} />

          {/* Farmer Details Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Farmer Details</Text>
          </View>
          <DetailRow label="Testing Date" value={formatDate(report.testing_date)} />
          <DetailRow label="Report Date" value={formatDate(report.report_date)} />

          {/* Soil Analysis Results Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Soil Analysis Results</Text>
          </View>
          <DetailRow label="Soil pH" value={report.soil_ph} />
          <DetailRow label="Nitrogen (N)" value={report.soil_nitrogen} />
          <DetailRow label="Phosphorus (P)" value={report.soil_phosphorus} />
          <DetailRow label="Potassium (K)" value={report.soil_potassium} />
          <DetailRow label="Organic Matter" value={report.soil_organic_matter} />
          <DetailRow label="Soil Texture" value={report.soil_texture} />

          {/* Report Summary & Recommendations */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Summary & Recommendations</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Report Summary</Text>
            <View style={[styles.detailValueContainer, styles.multilineContainer]}>
              <Text style={styles.detailValue}>{report.report_summary || 'No summary available'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recommendations</Text>
            <View style={[styles.detailValueContainer, styles.multilineContainer]}>
              <Text style={styles.detailValue}>{report.recommendations || 'No recommendations available'}</Text>
            </View>
          </View>
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
  multilineContainer: {
    minHeight: 60,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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