import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface HelpItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  action: 'navigate' | 'link' | 'contact';
  url?: string;
}

const helpItems: HelpItem[] = [
  {
    id: 'faq',
    title: 'FAQ',
    subtitle: 'Frequently asked questions',
    icon: 'help-outline',
    iconColor: '#4ECDC4',
    action: 'navigate',
  },
  {
    id: 'user_guide',
    title: 'User Guide',
    subtitle: 'How to use the app',
    icon: 'book',
    iconColor: '#45B7D1',
    action: 'navigate',
  },
  {
    id: 'contact_support',
    title: 'Contact Support',
    subtitle: 'Get in touch with our team',
    icon: 'support-agent',
    iconColor: '#96CEB4',
    action: 'contact',
  },
  {
    id: 'feedback',
    title: 'Send Feedback',
    subtitle: 'Help us improve the app',
    icon: 'feedback',
    iconColor: '#FFEAA7',
    action: 'link',
    url: 'mailto:support@agriconnect.lk',
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'Read our terms and conditions',
    icon: 'description',
    iconColor: '#DDA0DD',
    action: 'link',
    url: 'https://agriconnect.lk/terms',
  },
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    subtitle: 'How we protect your data',
    icon: 'security',
    iconColor: '#FF6B6B',
    action: 'link',
    url: 'https://agriconnect.lk/privacy',
  },
];

export default function HelpScreen() {
  const handleAction = (item: HelpItem) => {
    switch (item.action) {
      case 'navigate':
        if (item.id === 'faq') {
          router.push('/dashboard/faq');
        } else if (item.id === 'user_guide') {
          router.push('/dashboard/userGuide');
        }
        break;
      case 'link':
        if (item.url) {
          Linking.openURL(item.url).catch(() => {
            Alert.alert('Error', 'Could not open link');
          });
        }
        break;
      case 'contact':
        Alert.alert(
          'Contact Support',
          'How can we help you?',
          [
            {
              text: 'Call Support',
              onPress: () => Linking.openURL('tel:+94112345678'),
            },
            {
              text: 'Email Support',
              onPress: () => Linking.openURL('mailto:support@agriconnect.lk'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        break;
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Help Items */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>How can we help you?</Text>
        
        {helpItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.helpItem}
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
            
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color="#BDBDBD" 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need immediate help?</Text>
        <Text style={styles.contactText}>
          Call us: +94 11 234 5678{'\n'}
          Email: support@agriconnect.lk{'\n'}
          Hours: Mon-Fri 9:00 AM - 6:00 PM
        </Text>
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
  helpItem: {
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
  contactSection: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

