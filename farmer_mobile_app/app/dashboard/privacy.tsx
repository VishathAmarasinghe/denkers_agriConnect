import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { APIService } from '@/utils/apiService';
import { ServiceBaseUrl } from '@/config/config';

interface PrivacySetting {
  id: string;
  title: string;
  subtitle: string;
  type: 'toggle' | 'navigate';
  value?: boolean;
}

const privacySettings: PrivacySetting[] = [
  {
    id: 'data_sharing',
    title: 'Data Sharing',
    subtitle: 'Control how your data is shared',
    type: 'toggle',
    value: false,
  },
  {
    id: 'location_tracking',
    title: 'Location Tracking',
    subtitle: 'Allow app to access your location',
    type: 'toggle',
    value: true,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Help improve the app with analytics',
    type: 'toggle',
    value: true,
  },
  {
    id: 'change_password',
    title: 'Change Password',
    subtitle: 'Update your account password',
    type: 'navigate',
  },
];

export default function PrivacyScreen() {
  const [settings, setSettings] = useState(privacySettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (id: string, newValue: boolean) => {
    try {
      setIsLoading(true);
      
      // Update privacy setting via API
      await APIService.makeRequest({
        method: 'PUT',
        url: `${ServiceBaseUrl}/users/privacy-settings`,
        data: { [id]: newValue },
      });

      // Update local state
      setSettings(prev => 
        prev.map(item => 
          item.id === id ? { ...item, value: newValue } : item
        )
      );

      Alert.alert('Success', 'Privacy setting updated successfully');
    } catch (error: any) {
      console.error('Failed to update privacy setting:', error);
      Alert.alert('Error', 'Failed to update privacy setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (id: string) => {
    if (id === 'change_password') {
      router.push('/dashboard/changePassword');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Privacy Settings */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        {settings.map((setting) => (
          <View key={setting.id} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
            </View>
            
            {setting.type === 'toggle' ? (
              <Switch
                value={setting.value}
                onValueChange={(value) => handleToggle(setting.id, value)}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="white"
                disabled={isLoading}
              />
            ) : (
              <TouchableOpacity
                onPress={() => handleNavigate(setting.id)}
                style={styles.navigateButton}
              >
                <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  navigateButton: {
    padding: 8,
  },
});

