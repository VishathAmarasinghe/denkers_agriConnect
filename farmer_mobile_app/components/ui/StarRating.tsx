/**
 * StarRating component.
 * Displays a fixed number of stars (default 5) with an active value.
 * Pure presentational – no interaction logic included.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

/** Props for StarRating */
export interface StarRatingProps {
  value: number; // 0-5
  size?: number;
  max?: number;
  style?: ViewStyle;
  activeColor?: string;
  inactiveColor?: string;
}

/**
 * Renders a row of stars highlighting the first `value` stars.
 */
export const StarRating: React.FC<StarRatingProps> = ({
  value,
  size = 16,
  max = 5,
  style,
  activeColor = '#FFD700',
  inactiveColor = '#E0E0E0',
}) => (
  <View style={[styles.row, style]}>
    {Array.from({ length: max }).map((_, i) => (
      <Text
        key={i}
        style={[
          styles.star,
          { fontSize: size, color: i < value ? activeColor : inactiveColor },
        ]}
      >
        ★
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  star: { marginRight: 2 },
});

export default StarRating;
