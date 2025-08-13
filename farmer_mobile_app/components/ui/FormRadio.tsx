/**
 * FormRadio – controlled radio button with label.
 * Use alongside a group controller to manage mutually exclusive selection.
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

/** Props for FormRadio */
export interface FormRadioProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  size?: number;
  color?: string;
}

/**
 * Renders a single radio option.
 */
export const FormRadio: React.FC<FormRadioProps> = ({
  label,
  selected,
  onSelect,
  style,
  labelStyle,
  size = 22,
  color = '#52B788',
}) => (
  <TouchableOpacity style={[styles.row, style]} onPress={onSelect}>
    <View
      style={[
        styles.outer,
        { width: size, height: size, borderRadius: size / 2, borderColor: color },
        selected && { backgroundColor: color + '22' },
      ]}
    >
      {selected && <View style={[styles.inner, { backgroundColor: color, width: size * 0.45, height: size * 0.45, borderRadius: (size * 0.45)/2 }]} />}
    </View>
    <Text style={[styles.label, labelStyle]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  outer: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inner: {},
  label: { fontSize: 14, color: '#444', flexShrink: 1 },
});

export default FormRadio;
