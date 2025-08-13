/**
 * FormCheckbox – controlled checkbox with label.
 * Touching anywhere on the row toggles state (improves accessibility).
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

// Ratio used to derive rounded corner size from checkbox side length (tuned visually)
const CHECKBOX_BORDER_RADIUS_RATIO = 0.27;

/** Props for FormCheckbox */
export interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  size?: number;
  color?: string;
}

/**
 * Renders a checkbox with a text label.
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  checked,
  onChange,
  style,
  labelStyle,
  size = 22,
  color = Colors.primary?.main || '#52B788',
}) => (
  <TouchableOpacity style={[styles.row, style]} onPress={() => onChange(!checked)}>
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size * CHECKBOX_BORDER_RADIUS_RATIO, borderColor: color },
        checked && { backgroundColor: color + '22' },
      ]}
    >
      {checked && <Text style={[styles.tick, { color } ]}>✓</Text>}
    </View>
    <Text style={[styles.label, labelStyle]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: Colors.background?.default || '#fff',
  },
  tick: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 14, color: Colors.text?.secondary || '#444', flexShrink: 1 },
});

export default FormCheckbox;
