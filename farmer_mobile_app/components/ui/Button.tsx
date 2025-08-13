/**
 * Generic Button component.
 * - Supports primary (filled) and outline variants.
 * - Accepts custom color, disabled state, and style overrides.
 * - Intentionally minimal to stay reusable across features.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

/** Props for Button */
export interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'outline';
  color?: string; // primary color
}

const DEFAULT_COLOR = '#52B788';

/**
 * Renders a pressable button with variant styling.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled,
  style,
  textStyle,
  variant = 'primary',
  color = DEFAULT_COLOR,
}) => {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        { backgroundColor: isOutline ? 'transparent' : color, borderColor: color },
        isOutline && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: isOutline ? color : '#fff' }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  outline: { borderWidth: 1 },
  text: { fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
});

export default Button;
