// Officer Visit Services Flow Implementation
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, FlatList, StyleSheet } from 'react-native';
import { images } from '@/constants';

// Types
interface Expert {
  id: string;
  name: string;
  role: string; // category-specific role summary
  category: CategoryKey;
  photo: any; // require() image
  phone: string;
  rating: number; // 0-5
  description: string;
  hours: string;
}

type CategoryKey = 'General Support' | 'Pest Control' | 'Fertilizer Guidance';

// Static data (placeholder assets can be swapped later)
const EXPERTS: Expert[] = [
  {
    id: 'exp-1',
    name: 'Diane Russell',
    role: 'General Support Officer',
    category: 'General Support',
  photo: images.appLogo,
    phone: '071 234 5678',
    rating: 5,
    description:
      'Extension officer with 10+ years supporting smallholder farmers in crop planning, soil health, and sustainable practices.',
    hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
  },
  {
    id: 'exp-2',
    name: 'Savannah Nguyen',
    role: 'Pest Management Specialist',
    category: 'Pest Control',
  photo: images.appLogo,
    phone: '071 234 5679',
    rating: 4,
    description:
      'Specialist in integrated pest management and early detection strategies to reduce losses while protecting the environment.',
    hours: 'Mon - Fri • 9:00 AM - 4:00 PM',
  },
  {
    id: 'exp-3',
    name: 'Robert Fox',
    role: 'Fertilizer & Soil Advisor',
    category: 'Fertilizer Guidance',
  photo: images.appLogo,
    phone: '071 234 5680',
    rating: 5,
    description:
      'Guides farmers on balanced fertilizer application, soil testing interpretation, and long‑term soil fertility improvement.',
    hours: 'Mon - Fri • 8:00 AM - 2:00 PM',
  },
];

const CATEGORIES: CategoryKey[] = ['General Support', 'Pest Control', 'Fertilizer Guidance'];

// Issues & urgency options
const ISSUE_OPTIONS = [
  'Pest or Disease Issues',
  'Growth / Development Problems',
  'Water Management Issues',
  'Soil Nutrition Concerns',
  'Crop Management',
  'Other',
];

const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency (1-2 days)' },
  { value: 'standard', label: 'Standard (Within a week)' },
  { value: 'planning', label: 'Planning (Future guidance)' },
];

// Screen State Enum
enum Screen {
  Landing,
  ExpertsTabbed,
  FilteredSingle,
  Profile,
  ContactForm,
  Confirmation,
}

// Reusable UI bits
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <View style={styles.starRow}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Text key={i} style={[styles.star, i < rating ? styles.starActive : styles.starInactive]}>★</Text>
    ))}
  </View>
);

interface ExpertCardProps {
  expert: Expert;
  onPress?: (expert: Expert) => void;
  compact?: boolean;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onPress, compact }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.card, compact && styles.cardCompact]}
    onPress={() => onPress?.(expert)}
  >
    <Image source={expert.photo} style={styles.avatar} />
    <View style={styles.cardBody}>
      <Text style={styles.expertName}>{expert.name}</Text>
      <Text style={styles.expertRole}>{expert.role}</Text>
      <View style={styles.inlineRow}>
        <Text style={styles.iconText}>📞</Text>
        <Text style={styles.metaText}>{expert.phone}</Text>
      </View>
      <StarRating rating={expert.rating} />
    </View>
  </TouchableOpacity>
);

const ProfileView: React.FC<{ expert: Expert; onContact: () => void; onBack: () => void }> = ({ expert, onContact, onBack }) => (
  <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
    <View style={styles.profileCard}>
      <Image source={expert.photo} style={styles.profilePhoto} />
      <Text style={styles.profileName}>{expert.name}</Text>
      <Text style={styles.profileRole}>{expert.role}</Text>
      <Text style={styles.profileDesc}>{expert.description}</Text>
      <View style={styles.profileMetaRow}>
        <Text style={styles.iconText}>📞</Text>
        <Text style={styles.metaText}>{expert.phone}</Text>
      </View>
      <View style={styles.profileMetaRow}>
        <Text style={styles.iconText}>⏰</Text>
        <Text style={styles.metaText}>{expert.hours}</Text>
      </View>
      <View style={styles.infoStrip}>
        <Text style={styles.infoStripTitle}>Request Farm Visit</Text>
        <Text style={styles.infoStripText}>
          Get on-site assessment and personalized guidance to improve yield and reduce risks.
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={onContact}>
        <Text style={styles.primaryBtnText}>Contact Me</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
        <Text style={styles.secondaryBtnText}>Back</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

const ContactForm: React.FC<{ onSubmit: () => void; onBack: () => void }> = ({ onSubmit, onBack }) => {
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
    <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Contact Expert</Text>
        <TextInput
          placeholder="Your Name"
            // @ts-ignore - tailwind className support via nativewind
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
        <TouchableOpacity
          disabled={!canSubmit}
          onPress={onSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.disabledBtn]}
        >
          <Text style={styles.primaryBtnText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const Confirmation: React.FC<{ onFinish: () => void }> = ({ onFinish }) => (
  <View style={styles.confirmCard}>
    <View style={styles.checkCircle}>
      <Text style={styles.checkMark}>✓</Text>
    </View>
    <Text style={styles.confirmTitle}>Request Submitted</Text>
    <Text style={styles.confirmMsg}>
      Your request was sent. An expert will reach out soon to review details and arrange the visit.
    </Text>
    <TouchableOpacity style={styles.primaryBtn} onPress={onFinish}>
      <Text style={styles.primaryBtnText}>Finish</Text>
    </TouchableOpacity>
  </View>
);

// Main Component
const FieldVisitScreen: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Landing);
  const [category, setCategory] = useState<CategoryKey>('General Support');
  const [selected, setSelected] = useState<Expert | null>(null);

  const filteredExperts = useMemo(
    () => EXPERTS.filter(e => e.category === category),
    [category]
  );

  // Screen Renderers
  if (screen === Screen.Landing) {
    return (
      <ScrollView contentContainerStyle={styles.landingWrap} showsVerticalScrollIndicator={false}>
  <Image source={images.officerVisitLandingImage} style={styles.hero} />
        <View style={styles.landingCard}>
            <Text style={styles.appTitle}>Connect with</Text>
            <Text style={styles.appTitle}>Agricultural Experts</Text>
          <Text style={styles.appSubtitle}>
Get personalized agricultural advice from certified field officers. Choose from general farm support, pest control consultation, or fertilizer guidance - all delivered at your convenience.          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setScreen(Screen.ExpertsTabbed)}
            accessibilityRole="button"
            accessibilityLabel="Connect with experts"
          >
            <Text style={styles.primaryBtnText}>Connect Experts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === Screen.ExpertsTabbed) {
    return (
      <View style={styles.flex}>
        <View style={styles.tabRow}>
          {CATEGORIES.map(cat => {
            const isLong = cat.length > 15; // Fertilizer Guidance
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.tab, category === cat && styles.tabActive]}
                onPress={() => setCategory(cat)}
                accessibilityRole="button"
                accessibilityLabel={`Filter experts by ${cat}`}
              >
                <Text
                  numberOfLines={2} // allow up to two lines
                  style={[
                    styles.tabText,
                    isLong && styles.tabTextLong,
                    category === cat && styles.tabTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <FlatList
          data={filteredExperts}
          keyExtractor={it => it.id}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <ExpertCard
              expert={item}
              onPress={(e) => { setSelected(e); setScreen(Screen.FilteredSingle); }}
            />
          )}
        />
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScreen(Screen.Landing)}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === Screen.FilteredSingle && selected) {
    return (
      <View style={styles.flex}>
        <ExpertCard
          expert={selected}
          onPress={() => setScreen(Screen.Profile)}
          compact
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen(Screen.Profile)}>
          <Text style={styles.primaryBtnText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScreen(Screen.ExpertsTabbed)}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === Screen.Profile && selected) {
    return (
      <ProfileView
        expert={selected}
        onContact={() => setScreen(Screen.ContactForm)}
        onBack={() => setScreen(Screen.FilteredSingle)}
      />
    );
  }

  if (screen === Screen.ContactForm) {
    return <ContactForm onSubmit={() => setScreen(Screen.Confirmation)} onBack={() => setScreen(Screen.Profile)} />;
  }

  if (screen === Screen.Confirmation) {
    return <Confirmation onFinish={() => { setSelected(null); setScreen(Screen.Landing); }} />;
  }

  return null;
};

// Styles
const GREEN = '#52B788';
const GREEN_LIGHT = '#E2F7EF';
const GREEN_LIGHTER = '#CFF0E5';
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12 },
  landingWrap: { padding: 16 },
  hero: { width: '100%', height: 220, borderRadius: 20, marginBottom: 18, resizeMode: 'cover' },
  landingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  appTitle: { fontSize: 24, fontWeight: '700', color: GREEN, marginBottom: 8, textAlign: 'center' },
  appSubtitle: { fontSize: 15, lineHeight: 21, color: '#444', textAlign: 'center', marginBottom: 18 },
  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
  paddingHorizontal: 16, // ensure >=4px horizontal gap inside button
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 10,
    paddingVertical: 12,
  paddingHorizontal: 16, // ensure consistent horizontal spacing
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: { color: GREEN, fontWeight: '600', fontSize: 15 },
  disabledBtn: { opacity: 0.5 },
  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: GREEN },
  tabText: { fontSize: 13, fontWeight: '600', color: GREEN, paddingHorizontal: 4, textAlign: 'center', lineHeight: 16 },
  tabTextLong: { fontSize: 12, lineHeight: 15 },
  tabTextActive: { color: '#fff' },
  listPad: { paddingBottom: 32, paddingHorizontal: 4 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 4,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompact: { alignSelf: 'stretch' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0' },
  cardBody: { flex: 1, marginLeft: 14 },
  expertName: { fontSize: 16, fontWeight: '700', color: GREEN },
  expertRole: { fontSize: 13, fontWeight: '500', color: GREEN, marginBottom: 6 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  iconText: { fontSize: 16, marginRight: 4 },
  metaText: { fontSize: 13, color: '#444' },
  starRow: { flexDirection: 'row', marginTop: 2 },
  star: { fontSize: 16, marginRight: 2 },
  starActive: { color: '#FFD700' },
  starInactive: { color: '#E0E0E0' },
  profileScroll: { padding: 16 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 26,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  profilePhoto: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0E0E0', marginBottom: 12 },
  profileName: { fontSize: 20, fontWeight: '700', color: GREEN },
  profileRole: { fontSize: 14, fontWeight: '600', color: GREEN, marginBottom: 10 },
  profileDesc: { fontSize: 14, lineHeight: 20, color: '#444', textAlign: 'center', marginBottom: 14 },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoStrip: { backgroundColor: GREEN_LIGHT, borderRadius: 12, padding: 14, width: '100%', marginTop: 12, marginBottom: 18 },
  infoStripTitle: { fontSize: 15, fontWeight: '700', color: GREEN, marginBottom: 4 },
  infoStripText: { fontSize: 13, lineHeight: 18, color: GREEN },
  formScroll: { padding: 16 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: GREEN, marginBottom: 12, textAlign: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: GREEN, marginBottom: 6 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: GREEN_LIGHTER },
  checkboxTick: { fontSize: 14, color: GREEN, fontWeight: '700' },
  choiceLabel: { fontSize: 14, color: '#444', flexShrink: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterActive: { backgroundColor: GREEN_LIGHTER },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
  confirmCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  checkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: GREEN_LIGHTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkMark: { fontSize: 38, fontWeight: '700', color: GREEN },
  confirmTitle: { fontSize: 22, fontWeight: '700', color: GREEN, marginBottom: 12 },
  confirmMsg: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center', marginBottom: 24, paddingHorizontal: 6 },
});

export default FieldVisitScreen;
