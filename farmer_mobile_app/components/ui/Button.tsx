/**
 * Generic Button component.
 * - Supports primary (filled) and outline variants.
 * - Accepts custom color, disabled state, and style overrides.
 * - Intentionally minimal to stay reusable across features.
 */
import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

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

// Default brand accent (fallback if no color prop passed)
const DEFAULT_COLOR = Colors.primary?.main || '#52B788';

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
  const paletteColor = color || DEFAULT_COLOR;
  const containerStyle = useMemo(
    () => [
      styles.base,
      isOutline ? styles.outline : styles.filled,
      { borderColor: paletteColor, backgroundColor: isOutline ? 'transparent' : paletteColor },
      disabled && styles.disabled,
      style,
    ],
    [isOutline, paletteColor, disabled, style]
  );
  const labelStyleCombined = useMemo(
    () => [styles.text, { color: isOutline ? paletteColor : Colors.primary.contrastText }, textStyle],
    [isOutline, paletteColor, textStyle]
  );
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={containerStyle}
    >
      <Text style={labelStyleCombined}>{label}</Text>
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
  filled: {},
  text: { fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
});

export default Button;
