import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUserProfile } from '@/slice/authSlice/Auth';
import { AppDispatch } from '@/slice/store';
import { router } from 'expo-router';
import { APIService } from '@/utils/apiService';
import { ServiceBaseUrl } from '@/config/config';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector(selectUserProfile);
  const [settings, setSettings] = useState<SettingsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeSettings();
  }, [userProfile]);

  const initializeSettings = () => {
    const defaultSettings: SettingsItem[] = [
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Manage your notifications',
        icon: 'notifications',
        iconColor: '#FF6B6B',
        type: 'toggle',
        value: true,
        onPress: () => handleNotificationToggle(),
      },
      {
        id: 'language',
        title: 'Language',
        subtitle: 'English',
        icon: 'language',
        iconColor: '#4ECDC4',
        type: 'navigate',
        onPress: () => router.push('/dashboard/language'),
      },
      {
        id: 'privacy',
        title: 'Privacy & Security',
        subtitle: 'Manage your privacy settings',
        icon: 'security',
        iconColor: '#45B7D1',
        type: 'navigate',
        onPress: () => router.push('/dashboard/privacy'),
      },
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'Get help and contact support',
        icon: 'help',
        iconColor: '#96CEB4',
        type: 'navigate',
        onPress: () => router.push('/dashboard/help'),
      },
      {
        id: 'about',
        title: 'About',
        subtitle: 'App version and information',
        icon: 'info',
        iconColor: '#FFEAA7',
        type: 'navigate',
        onPress: () => router.push('/dashboard/about'),
      },
      {
        id: 'logout',
        title: 'Logout',
        subtitle: 'Sign out of your account',
        icon: 'logout',
        iconColor: '#DDA0DD',
        type: 'action',
        onPress: () => handleLogout(),
      },
    ];

    setSettings(defaultSettings);
  };

  const handleNotificationToggle = async () => {
    try {
      setIsLoading(true);
      // Update notification settings via API
      const response = await APIService.makeRequest({
        method: 'PUT',
        url: `${ServiceBaseUrl}/users/notification-settings`,
        data: {
          notifications_enabled: !settings.find(s => s.id === 'notifications')?.value,
        },
      });

      // Update local state
      setSettings(prev => 
        prev.map(item => 
          item.id === 'notifications' 
            ? { ...item, value: !item.value }
            : item
        )
      );

      // Show success message
      Alert.alert('Success', 'Notification settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API
              await APIService.makeRequest({
                method: 'POST',
                url: `${ServiceBaseUrl}/auth/logout`,
              });
            } catch (error) {
              console.error('Logout API error:', error);
            } finally {
              // Always logout locally regardless of API response
              dispatch(logout());
              router.replace('/auth/signIn');
            }
          },
        },
      ]
    );
  };

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingsItem}
        onPress={item.onPress}
        disabled={isLoading}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
            <MaterialIcons name={item.icon} size={24} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: '#E0E0E0', true: item.iconColor }}
              thumbColor="white"
              disabled={isLoading}
            />
          ) : (
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color="#BDBDBD" 
            />
          )}
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImage}>
          <MaterialIcons name="person" size={40} color="#666" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {userProfile?.first_name && userProfile?.last_name
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : userProfile?.username || 'User'
            }
          </Text>
          <Text style={styles.profileEmail}>
            {userProfile?.email || userProfile?.phone || 'No contact info'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/dashboard/profile')}
        >
          <MaterialIcons name="edit" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Settings List */}
      <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
        {settings.map(renderSettingsItem)}
      </ScrollView>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>App Version 1.0.0</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  itemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});

