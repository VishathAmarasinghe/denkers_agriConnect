import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './types';

export const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <View style={styles.starRow}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Text
        key={i}
        style={[
          styles.star,
          { fontSize: size },
          i < rating ? styles.starActive : styles.starInactive,
        ]}
      >
        ★
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  starRow: { flexDirection: 'row', marginTop: 2 },
  star: { marginRight: 2 },
  starActive: { color: '#FFD700' },
  starInactive: { color: '#E0E0E0' },
});
