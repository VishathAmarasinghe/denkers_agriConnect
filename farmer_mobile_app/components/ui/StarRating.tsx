import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export interface StarRatingProps {
  value: number; // 0-5
  size?: number;
  max?: number;
  style?: ViewStyle;
  activeColor?: string;
  inactiveColor?: string;
}

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
