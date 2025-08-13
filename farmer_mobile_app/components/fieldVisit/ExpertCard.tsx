import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Expert, COLORS } from './types';
import { images } from '@/constants';
import { StarRating } from './StarRating';

interface Props { expert: Expert; onPress?: (e: Expert) => void; compact?: boolean }

export const ExpertCard: React.FC<Props> = ({ expert, onPress, compact }) => {
  const [error, setError] = useState(false);
  const imgSource = !error && expert.avatarUrl ? { uri: expert.avatarUrl } : (expert.photo || images.appLogo);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress?.(expert)}
    >
      <Image source={imgSource} style={styles.avatar} onError={() => setError(true)} />
      <View style={styles.cardBody}>
        <Text style={styles.expertName}>{expert.name}</Text>
        <Text style={styles.expertRole}>{expert.role}</Text>
        <View style={styles.inlineRow}>
          <View style={styles.phoneRow}>
            <Text style={styles.iconText}>📞</Text>
            <Text style={styles.metaText}>{expert.phone}</Text>
          </View>
          <View style={styles.ratingRight}>
            <StarRating rating={expert.rating} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  cardCompact: { alignSelf: 'stretch' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0' },
  cardBody: { flex: 1, marginLeft: 14 },
  expertName: { fontSize: 16, fontWeight: '700', color: COLORS.GREEN },
  expertRole: { fontSize: 13, fontWeight: '500', color: '#222', marginBottom: 6 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  ratingRight: { flexDirection: 'row', alignItems: 'center' },
  iconText: { fontSize: 16, marginRight: 4 },
  metaText: { fontSize: 13, color: '#444' },
});
