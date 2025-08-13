import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from './types';

interface Props {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<Props> = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={[styles.btn, disabled && styles.disabled, style]}
  >
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 6,
    marginHorizontal: 16,
  },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
});
