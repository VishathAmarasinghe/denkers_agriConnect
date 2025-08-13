import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './types';

interface Props { title: string; onBack?: () => void }

export const Header: React.FC<Props> = ({ title, onBack }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={styles.headerBackHit}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_DARK} />
      </TouchableOpacity>
    ) : (
      <View style={styles.headerBackPlaceholder} />
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerBackPlaceholder} />
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  headerBackHit: { padding: 4, paddingRight: 8 },
  headerBackPlaceholder: { width: 30 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.TEXT_DARK },
});
