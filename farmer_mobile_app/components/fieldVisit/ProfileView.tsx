import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Expert, COLORS } from './types';
import { images } from '@/constants';
import { PrimaryButton } from './PrimaryButton';

interface Props { expert: Expert; onContact: () => void }

const MetaRow: React.FC<{ icon: string; value: string }> = ({ icon, value }) => (
  <View style={styles.metaRow}>
    <Text style={styles.iconText}>{icon}</Text>
    <Text style={styles.metaText}>{value}</Text>
  </View>
);

export const ProfileView: React.FC<Props> = ({ expert, onContact }) => {
  const [imgError, setImgError] = useState(false);
  const profileImgSource = !imgError && expert.avatarUrl ? { uri: expert.avatarUrl } : (expert.photo || images.appLogo);
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Image source={profileImgSource} style={styles.photo} onError={() => setImgError(true)} />
        <Text style={styles.name}>{expert.name}</Text>
        <Text style={styles.role}>{expert.role}</Text>
        <Text style={styles.desc}>{expert.description}</Text>
        <MetaRow icon="📞" value={expert.phone} />
        <MetaRow icon="⏰" value={expert.hours} />
        <MetaRow icon="📍" value={expert.officeLocation} />
        <View style={styles.infoStrip}>
          <Text style={styles.infoStripTitle}>Request Farm Visit</Text>
          <Text style={styles.infoStripText}>
            Get on-site assessment and personalized guidance to improve yield and reduce risks.
          </Text>
        </View>
        <PrimaryButton title="Contact Me" onPress={onContact} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 26,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  photo: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0E0E0', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.GREEN },
  role: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 10 },
  desc: { fontSize: 14, lineHeight: 20, color: '#444', textAlign: 'center', marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  iconText: { fontSize: 16, marginRight: 4 },
  metaText: { fontSize: 13, color: '#444' },
  infoStrip: { backgroundColor: COLORS.GREEN_LIGHT, borderRadius: 12, padding: 14, width: '100%', marginTop: 12, marginBottom: 18 },
  infoStripTitle: { fontSize: 15, fontWeight: '700', color: COLORS.GREEN, marginBottom: 4 },
  infoStripText: { fontSize: 13, lineHeight: 18, color: COLORS.GREEN },
});
