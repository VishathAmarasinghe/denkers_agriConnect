
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface HeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showPlaceholderSides?: boolean;
  color?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  right,
  style,
  titleStyle,
  showPlaceholderSides = true,
  color = '#222',
}) => (
  <View style={[styles.root, style]}>
    {onBack ? (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={styles.backHit}
      >
        <Ionicons name="arrow-back" size={24} color={color} />
      </TouchableOpacity>
    ) : showPlaceholderSides ? (
      <View style={styles.placeholder} />
    ) : null}

    {title ? <Text style={[styles.title, { color }, titleStyle]}>{title}</Text> : <View style={styles.flex} />}

    {right ? right : showPlaceholderSides ? <View style={styles.placeholder} /> : null}
  </View>
);

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  backHit: { padding: 4, paddingRight: 8 },
  placeholder: { width: 30 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  flex: { flex: 1 },
});

export default Header;
