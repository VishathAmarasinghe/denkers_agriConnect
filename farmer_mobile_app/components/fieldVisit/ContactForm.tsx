import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ISSUE_OPTIONS, URGENCY_OPTIONS, COLORS } from './types';
import { PrimaryButton } from './PrimaryButton';

interface Props { onSubmit: () => void }

export const ContactForm: React.FC<Props> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [urgency, setUrgency] = useState('standard');

  const toggleIssue = useCallback((val: string) => {
    setIssues(prev => (prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]));
  }, []);

  const canSubmit = name.trim() && mobile.trim();

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact Expert</Text>
        <TextInput
          placeholder="Your Name"
          className="mb-3 rounded-xl border border-green-200 bg-white/90 px-4 py-3 text-base text-gray-800"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          className="mb-3 rounded-xl border border-green-200 bg-white/90 px-4 py-3 text-base text-gray-800"
          value={mobile}
          onChangeText={setMobile}
        />
        <TextInput
          placeholder="Address"
          className="mb-4 rounded-xl border border-green-200 bg-white/90 px-4 py-3 text-base text-gray-800"
          value={address}
          onChangeText={setAddress}
        />
        <Text style={styles.fieldLabel}>What issues are you facing?</Text>
        {ISSUE_OPTIONS.map(opt => (
          <TouchableOpacity key={opt} style={styles.choiceRow} onPress={() => toggleIssue(opt)}>
            <View style={[styles.checkbox, issues.includes(opt) && styles.checkboxChecked]}>
              {issues.includes(opt) && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.choiceLabel}>{opt}</Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>How urgent is this issue?</Text>
        {URGENCY_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.value} style={styles.choiceRow} onPress={() => setUrgency(opt.value)}>
            <View style={[styles.radioOuter, urgency === opt.value && styles.radioOuterActive]}>
              {urgency === opt.value && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.choiceLabel}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <PrimaryButton title="Submit" disabled={!canSubmit} onPress={onSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.GREEN, marginBottom: 12, textAlign: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.GREEN, marginBottom: 6 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: COLORS.GREEN_LIGHTER },
  checkboxTick: { fontSize: 14, color: COLORS.GREEN, fontWeight: '700' },
  choiceLabel: { fontSize: 14, color: '#444', flexShrink: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterActive: { backgroundColor: COLORS.GREEN_LIGHTER },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.GREEN },
});
