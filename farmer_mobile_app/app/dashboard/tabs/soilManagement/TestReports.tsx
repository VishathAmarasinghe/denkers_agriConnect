import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface ApiResponse {
  success: boolean;
  message: string;
  data: SoilReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TestReports() {
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // get the farmer id from the loacal storage

  useEffect(() => {
    const getFarmerId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
        setFarmerId(id);
        setUserToken(token);
      } catch (error) {
        console.error('Error getting farmer ID:', error);
      }
    };
    getFarmerId();
  }, []);

  const fetchReports = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      console.log('token:', userToken);
      const response = await fetch(
        `http://206.189.89.116:3000/api/v1/soil-testing-reports/farmer/${farmerId}?page=${pageNum}&limit=10`, {
          headers: {
          'Authorization': `Bearer ${userToken}`,
        }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        if (append) {
          setReports(prev => [...prev, ...data.data]);
        } else {
          setReports(data.data);
        }
        setHasMore(pageNum < data.pagination.totalPages);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Alert.alert('Error', 'Failed to fetch soil test reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleBack = () => {
    router.push('/dashboard/tabs/soilManagement');
  };

  const handleDownloadReport = (report: SoilReport) => {
    // Handle PDF download logic here
    console.log(`Downloading report ${report.report_file_name}`);
    // You can implement file download logic here
  };

  const handleViewReport = (reportId: number) => {
    // Find the report data
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // Navigate with the report data as query parameters
      const reportData = encodeURIComponent(JSON.stringify(report));
      router.push(`/dashboard/tabs/soilManagement/DetailedTestReport?reportId=${reportId}&reportData=${reportData}`);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getReportStatus = (report: SoilReport) => {
    const reportDate = new Date(report.report_date);
    const now = new Date();
    
    if (reportDate <= now) {
      return {
        status: 'ready',
        statusText: 'Report Ready',
        statusColor: '#6BCF7F',
      };
    } else {
      return {
        status: 'processing',
        statusText: 'Processing',
        statusColor: '#f39c12',
      };
    }
  };

  const renderStatusDot = (status: string, color: string) => {
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color: color }]}>{status}</Text>
      </View>
    );
  };

  const loadMoreReports = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReports(nextPage, true);
    }
  };

  const onRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchReports(1, false);
  };

  if (loading && reports.length === 0) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6BCF7F" />
          <Text style={styles.loadingText}>Loading reports...</Text>
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
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Your Soil Test Reports</Text>
          <Text style={styles.sectionDescription}>
            Access all your test reports in one place. View detailed analysis, download PDF reports, and track improvements in your soil health over time.
          </Text>
        </View>

        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports available</Text>
            <Text style={styles.emptySubtext}>
              Your soil test reports will appear here once they are ready.
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.reportsList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reportsContainer}
            onScrollEndDrag={loadMoreReports}
          >
            {reports.map((report) => {
              const statusInfo = getReportStatus(report);
              
              return (
                <TouchableOpacity 
                  key={report.id} 
                  style={styles.reportCard}
                  onPress={() => handleViewReport(report.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportContent}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle} numberOfLines={1}>
                        {report.report_title}
                      </Text>
                      <Text style={styles.sendDate}>
                        Test Date - {formatDate(report.testing_date)}
                      </Text>
                      <Text style={styles.centerName} numberOfLines={1}>
                        {report.center_name}
                      </Text>
                    </View>
                    
                    <View style={styles.statusSection}>
                      {renderStatusDot(statusInfo.statusText, statusInfo.statusColor)}
                      <TouchableOpacity 
                        style={styles.downloadButton}
                        onPress={() => handleDownloadReport(report)}
                      >
                        <Ionicons name="download-outline" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {loading && reports.length > 0 && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#6BCF7F" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            )}
            
            {!hasMore && reports.length > 0 && (
              <Text style={styles.endText}>No more reports to load</Text>
            )}
          </ScrollView>
        )}
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
  refreshButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
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
    alignItems: 'flex-start',
  },
  reportInfo: {
    flex: 1,
    marginRight: 10,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sendDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  centerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  downloadButton: {
    padding: 4,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    color: '#666',
  },
  endText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
});