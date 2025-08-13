import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './types';
import { PrimaryButton } from './PrimaryButton';

interface Props { onFinish: () => void }

export const Confirmation: React.FC<Props> = ({ onFinish }) => (
  <View style={styles.confirmCard}>
    <View style={styles.checkCircle}>
      <Text style={styles.checkMark}>✓</Text>
    </View>
    <Text style={styles.confirmTitle}>Request Submitted Successfully!</Text>
    <Text style={styles.confirmMsg}>
      Your field visit request has been successfully submitted! Our agricultural officer will review your concerns and contact you within 24 hours to discuss available time slots and schedule the farm visit.
    </Text>
    <PrimaryButton title="Finish" onPress={onFinish} />
  </View>
);

const styles = StyleSheet.create({
  confirmCard: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  checkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.GREEN_LIGHTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkMark: { fontSize: 38, fontWeight: '700', color: COLORS.GREEN },
  confirmTitle: { fontSize: 22, fontWeight: '700', color: COLORS.GREEN, marginBottom: 12, textAlign: 'center' },
  confirmMsg: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center', marginBottom: 24, paddingHorizontal: 6 },
});
