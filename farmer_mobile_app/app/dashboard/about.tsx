import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface AboutItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  action: 'navigate' | 'link';
  url?: string;
}

const aboutItems: AboutItem[] = [
  {
    id: 'version',
    title: 'App Version',
    subtitle: '1.0.0',
    icon: 'info',
    iconColor: '#4ECDC4',
    action: 'navigate',
  },
  {
    id: 'build',
    title: 'Build Number',
    subtitle: '2024.1.0',
    icon: 'build',
    iconColor: '#45B7D1',
    action: 'navigate',
  },
  {
    id: 'website',
    title: 'Website',
    subtitle: 'Visit our website',
    icon: 'language',
    iconColor: '#96CEB4',
    action: 'link',
    url: 'https://agriconnect.lk',
  },
  {
    id: 'social',
    title: 'Social Media',
    subtitle: 'Follow us on social media',
    icon: 'share',
    iconColor: '#FFEAA7',
    action: 'link',
    url: 'https://facebook.com/agriconnect',
  },
  {
    id: 'feedback',
    title: 'Rate App',
    subtitle: 'Rate us on App Store',
    icon: 'star',
    iconColor: '#FFD93D',
    action: 'link',
    url: 'https://apps.apple.com/app/agriconnect',
  },
];

export default function AboutScreen() {
  const handleAction = (item: AboutItem) => {
    if (item.action === 'link' && item.url) {
      Linking.openURL(item.url).catch(() => {
        // Handle error silently
      });
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo and Name */}
        <View style={styles.appSection}>
          <View style={styles.appLogo}>
            <MaterialIcons name="agriculture" size={60} color="#52B788" />
          </View>
          <Text style={styles.appName}>AgriConnect</Text>
          <Text style={styles.appTagline}>Connecting Farmers to Technology</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* About Items */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          {aboutItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.aboutItem}
              onPress={() => handleAction(item)}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
                  <MaterialIcons name={item.icon} size={24} color="white" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              
              {item.action === 'link' && (
                <MaterialIcons 
                  name="open-in-new" 
                  size={20} 
                  color="#BDBDBD" 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Company Information */}
        <View style={styles.companySection}>
          <Text style={styles.sectionTitle}>Company</Text>
          
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>AgriConnect Lanka</Text>
            <Text style={styles.companyDescription}>
              AgriConnect is a comprehensive agricultural technology platform designed to 
              empower farmers with modern tools, knowledge, and resources. Our mission is 
              to bridge the gap between traditional farming practices and cutting-edge 
              agricultural technology.
            </Text>
            
            <View style={styles.companyDetails}>
              <Text style={styles.companyDetail}>
                <Text style={styles.detailLabel}>Address: </Text>
                123 Agriculture Street, Colombo 01, Sri Lanka
              </Text>
              <Text style={styles.companyDetail}>
                <Text style={styles.detailLabel}>Phone: </Text>
                +94 11 234 5678
              </Text>
              <Text style={styles.companyDetail}>
                <Text style={styles.detailLabel}>Email: </Text>
                info@agriconnect.lk
              </Text>
              <Text style={styles.companyDetail}>
                <Text style={styles.detailLabel}>Website: </Text>
                www.agriconnect.lk
              </Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 AgriConnect Lanka. All rights reserved.
          </Text>
          <Text style={styles.copyrightText}>
            Made with ❤️ for Sri Lankan Farmers
          </Text>
        </View>
      </ScrollView>
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
  },
  appSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  appLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
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
  companySection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  companyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  companyDetails: {
    width: '100%',
  },
  companyDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  copyrightSection: {
    padding: 20,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
});

