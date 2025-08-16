import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { APIService } from '@/utils/apiService';
import { ServiceBaseUrl } from '@/config/config';

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  code: string;
}

const languages: LanguageOption[] = [
  { id: 'en', name: 'English', nativeName: 'English', code: 'en' },
  { id: 'si', name: 'Sinhala', nativeName: 'සිංහල', code: 'si' },
  { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', code: 'ta' },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setIsLoading(true);
      
      // Update language via API
      await APIService.makeRequest({
        method: 'PUT',
        url: `${ServiceBaseUrl}/users/language`,
        data: { language: languageCode },
      });

      setSelectedLanguage(languageCode);
      Alert.alert('Success', 'Language updated successfully');
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to update language:', error);
      Alert.alert('Error', 'Failed to update language');
    } finally {
      setIsLoading(false);
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
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Language Options */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Language</Text>
        
        {languages.map((language) => (
          <TouchableOpacity
            key={language.id}
            style={[
              styles.languageItem,
              selectedLanguage === language.code && styles.selectedLanguage,
            ]}
            onPress={() => handleLanguageChange(language.code)}
            disabled={isLoading}
          >
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                selectedLanguage === language.code && styles.selectedLanguageText,
              ]}>
                {language.name}
              </Text>
              <Text style={[
                styles.languageNative,
                selectedLanguage === language.code && styles.selectedLanguageText,
              ]}>
                {language.nativeName}
              </Text>
            </View>
            
            {selectedLanguage === language.code && (
              <MaterialIcons name="check" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
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
  languageItem: {
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
  selectedLanguage: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
    color: '#666',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

