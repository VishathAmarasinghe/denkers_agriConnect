/**
 * FormRadio – controlled radio button with label.
 * Use alongside a group controller to manage mutually exclusive selection.
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

// Ratio used for sizing the filled inner circle relative to the outer diameter
const INNER_CIRCLE_RATIO = 0.45;

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
  color = Colors.primary?.main || '#52B788',
}) => {
  const innerCircleSize = size * INNER_CIRCLE_RATIO;
  const innerCircleRadius = innerCircleSize / 2;
  return (
    <TouchableOpacity style={[styles.row, style]} onPress={onSelect}>
      <View
        style={[
          styles.outer,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
          selected && { backgroundColor: color + '22' },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.inner,
              {
                backgroundColor: color,
                width: innerCircleSize,
                height: innerCircleSize,
                borderRadius: innerCircleRadius,
              },
            ]}
          />
        )}
      </View>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  outer: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inner: {},
  label: { fontSize: 14, color: Colors.text?.secondary || '#444', flexShrink: 1 },
});

export default FormRadio;
