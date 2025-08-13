// Officer Visit Services Flow Implementation
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { images } from '@/constants';

// Types
interface Expert {
  id: string;
  name: string;
  role: string; // category-specific role summary
  category: CategoryKey;
  photo?: any; // local require image fallback
  avatarUrl?: string; // remote image url
  phone: string;
  officeLocation: string; // new: office / service base location
  rating: number; // 0-5
  description: string;
  hours: string;
}

type CategoryKey = 'General Support' | 'Pest Control' | 'Fertilizer Guidance';

// Static data (placeholder assets can be swapped later)
const EXPERTS: Expert[] = [
  {
    id: 'exp-1',
  name: 'දිනූෂි පෙරේරා',
    role: 'General Support Officer',
    category: 'General Support',
    photo: images.appLogo,
    phone: '071 234 5678',
  officeLocation: 'District Office - Galle',
    rating: 5,
    description:
      'Extension officer with 10+ years supporting smallholder farmers in crop planning, soil health, and sustainable practices.',
    hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
  },
  {
    id: 'exp-2',
  name: 'සවිනී ගුණසේකර',
    role: 'Pest Management Specialist',
    category: 'Pest Control',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    phone: '071 234 5679',
  officeLocation: 'Regional Agricenter - Matara',
    rating: 4,
    description:
      'Specialist in integrated pest management and early detection strategies to reduce losses while protecting the environment.',
    hours: 'Mon - Fri • 9:00 AM - 4:00 PM',
  },
  {
    id: 'exp-3',
  name: 'රොහිත ප්‍රනාන්දු',
    role: 'Fertilizer & Soil Advisor',
    category: 'Fertilizer Guidance',
    photo: images.appLogo,
    phone: '071 234 5680',
  officeLocation: 'Soil Lab Hub - Kandy',
    rating: 5,
    description:
      'Guides farmers on balanced fertilizer application, soil testing interpretation, and long‑term soil fertility improvement.',
    hours: 'Mon - Fri • 8:00 AM - 2:00 PM',
  },
  {
    id: 'exp-4',
  name: 'මාලිනී ජයසිංහ',
    role: 'Pest Surveillance Officer',
    category: 'Pest Control',
    photo: images.appLogo,
    phone: '071 234 5681',
  officeLocation: 'Field Station - Hambantota',
    rating: 4,
    description:
      'Monitors and advises on pest population trends and early warning actions for reduced crop damage.',
    hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
  },
  {
    id: 'exp-5',
  name: 'ලසන්ත කුමාර',
    role: 'Soil Sampling Technician',
    category: 'Fertilizer Guidance',
    photo: images.appLogo,
    phone: '071 234 5682',
  officeLocation: 'Agri Service Point - Kurunegala',
    rating: 3,
    description:
      'Collects and interprets soil test data to tailor nutrient programs and reduce input wastage.',
    hours: 'Mon - Fri • 9:00 AM - 4:00 PM',
  },
  {
    id: 'exp-6',
  name: 'අමිලා දිසානායක',
    role: 'Crop Rotation Advisor',
    category: 'General Support',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    phone: '071 234 5683',
  officeLocation: 'Extension Center - Anuradhapura',
    rating: 5,
    description:
      'Helps design rotation plans improving soil structure, nutrient cycling, and long-term productivity.',
    hours: 'Mon - Fri • 8:00 AM - 3:00 PM',
  },
  {
    id: 'exp-7',
  name: 'චාමර වීරසිංහ',
    role: 'Biological Control Specialist',
    category: 'Pest Control',
    photo: images.appLogo,
    phone: '071 234 5684',
  officeLocation: 'Pest Monitoring Unit - Badulla',
    rating: 5,
    description:
      'Advises on beneficial insects, microbial pesticides, and ecosystem-friendly suppression strategies.',
    hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
  },
  {
    id: 'exp-8',
  name: 'ප්‍රියංකරී විජේසිංහ',
    role: 'Nutrient Management Consultant',
    category: 'Fertilizer Guidance',
    photo: images.appLogo,
    phone: '071 234 5685',
  officeLocation: 'Nutrient Advisory Desk - Polonnaruwa',
    rating: 4,
    description:
      'Optimizes fertilizer scheduling and blending to match crop stages while minimizing leaching.',
    hours: 'Mon - Fri • 9:00 AM - 4:30 PM',
  },
  {
    id: 'exp-9',
  name: 'සමන් මෙන්ඩිස්',
    role: 'Farm Risk Assessor',
    category: 'General Support',
    photo: images.appLogo,
    phone: '071 234 5686',
  officeLocation: 'Risk Advisory Cell - Jaffna',
    rating: 4,
    description:
      'Evaluates weather, pest, and market risks to guide contingency and resilience planning.',
    hours: 'Mon - Fri • 8:00 AM - 3:30 PM',
  },
  {
    id: 'exp-10',
  name: 'ඇලීනා පෙරේරා',
    role: 'Post-Harvest Handling Expert',
    category: 'General Support',
    photo: images.appLogo,
    phone: '071 234 5687',
  officeLocation: 'Post-Harvest Center - Colombo',
    rating: 5,
    description:
      'Supports improved storage, grading, and transport practices to reduce post-harvest losses.',
    hours: 'Mon - Fri • 8:30 AM - 3:00 PM',
  },
  {
    id: 'exp-11',
  name: 'ඉබ්‍රාහිම් කාරිම්',
    role: 'Weed Management Specialist',
    category: 'Pest Control',
    photo: images.appLogo,
    phone: '071 234 5688',
  officeLocation: 'Weed Control Section - Ratnapura',
    rating: 3,
    description:
      'Designs integrated weed control programs balancing mechanical, cultural, and chemical tactics.',
    hours: 'Mon - Fri • 9:00 AM - 4:00 PM',
  },
  {
    id: 'exp-12',
  name: 'ෆාතිමා නූර්',
    role: 'Sustainable Inputs Advisor',
    category: 'Fertilizer Guidance',
    photo: images.appLogo,
    phone: '071 234 5689',
  officeLocation: 'Sustainable Inputs Hub - Monaragala',
    rating: 5,
    description:
      'Guides adoption of biofertilizers and organic amendments to build long-term soil vitality.',
    hours: 'Mon - Fri • 8:00 AM - 2:30 PM',
  },
  {
    id: 'exp-13',
  name: 'ජයන්ත රණසිංහ',
    role: 'Irrigation & Water Use Officer',
    category: 'General Support',
    photo: images.appLogo,
    phone: '071 234 5690',
  officeLocation: 'Water Management Office - Trincomalee',
    rating: 4,
    description:
      'Advises on efficient irrigation scheduling, water conservation, and system maintenance.',
    hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
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
  FilteredSingle, // retained for potential future use but no longer navigated to
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

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onPress, compact }) => {
  const [error, setError] = useState(false);
  const imgSource = !error && expert.avatarUrl
    ? { uri: expert.avatarUrl }
    : (expert.photo || images.appLogo);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress?.(expert)}
    >
      <Image
        source={imgSource}
        style={styles.avatar}
        onError={() => setError(true)}
      />
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

const ProfileView: React.FC<{ expert: Expert; onContact: () => void }> = ({ expert, onContact }) => {
  const [imgError, setImgError] = useState(false);
  const profileImgSource = !imgError && expert.avatarUrl
    ? { uri: expert.avatarUrl }
    : (expert.photo || images.appLogo);
  return (
    <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <Image
          source={profileImgSource}
          style={styles.profilePhoto}
          onError={() => setImgError(true)}
        />
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
        <View style={styles.profileMetaRow}>
          <Text style={styles.iconText}>📍</Text>
          <Text style={styles.metaText}>{expert.officeLocation}</Text>
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
      </View>
    </ScrollView>
  );
};

const ContactForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
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
      </View>
    </ScrollView>
  );
};

const Confirmation: React.FC<{ onFinish: () => void }> = ({ onFinish }) => (
  <View style={styles.confirmCard}>
    <View style={styles.checkCircle}>
      <Text style={styles.checkMark}>✓</Text>
    </View>
    <Text style={styles.confirmTitle}>Request Submitted Successfully!</Text>
    <Text style={styles.confirmMsg}>
      Your field visit request has been successfully submitted! Our agricultural officer will review your concerns and contact you within 24 hours to discuss available time slots and schedule the farm visit.
    </Text>
    <TouchableOpacity style={styles.primaryBtn} onPress={onFinish}>
      <Text style={styles.primaryBtnText}>Finish</Text>
    </TouchableOpacity>
  </View>
);

// Header component
const Header: React.FC<{ title: string; onBack?: () => void }> = ({ title, onBack }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.headerBackHit}>
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>
    ) : (
      <View style={styles.headerBackPlaceholder} />
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerBackPlaceholder} />
  </View>
);

// Main Component
export const options = {
  tabBarStyle: { display: 'none' },
};

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
      <View style={styles.landingRoot}>
        <ImageBackground
          source={images.officerVisitLandingImage}
          style={styles.bgImage}
          imageStyle={styles.bgImageInner}
        >
          <View style={styles.bgOverlay} />
          <View style={styles.landingCardOverlay}>
            <Text style={styles.appTitle}>Connect with</Text>
            <Text style={styles.appTitle}>Agricultural Experts</Text>
            <Text style={styles.appSubtitle}>
              Get personalized agricultural advice from certified field officers. Choose from general farm support, pest control consultation, or fertilizer guidance - all delivered at your convenience.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setScreen(Screen.ExpertsTabbed)}
              accessibilityRole="button"
              accessibilityLabel="Connect with experts"
            >
              <Text style={styles.primaryBtnText}>Connect Experts</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }

  if (screen === Screen.ExpertsTabbed) {
    return (
      <View style={styles.flex}>
        <Header title="Experts" onBack={() => setScreen(Screen.Landing)} />
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
      onPress={(e) => { setSelected(e); setScreen(Screen.Profile); }}
            />
          )}
        />
      </View>
    );
  }

  if (screen === Screen.Profile && selected) {
    return (
      <View style={styles.flex}>
  <Header title="Experts Profile" onBack={() => { setSelected(null); setScreen(Screen.ExpertsTabbed); }} />
        <ProfileView
          expert={selected}
          onContact={() => setScreen(Screen.ContactForm)}
        />
      </View>
    );
  }

  if (screen === Screen.ContactForm) {
    return (
      <View style={styles.flex}>
        <Header title="Contact" onBack={() => setScreen(Screen.Profile)} />
        <ContactForm onSubmit={() => setScreen(Screen.Confirmation)} />
      </View>
    );
  }

  if (screen === Screen.Confirmation) {
    return (
      <View style={styles.flex}>
        <Header title="" onBack={() => { setSelected(null); setScreen(Screen.Landing); }} />
        <Confirmation onFinish={() => { setSelected(null); setScreen(Screen.Landing); }} />
      </View>
    );
  }

  return null;
};

// Styles
const GREEN = '#52B788';
const GREEN_LIGHT = '#E2F7EF';
const GREEN_LIGHTER = '#CFF0E5';
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12 },
  landingRoot: { flex: 1 },
  bgImage: { flex: 1, justifyContent: 'flex-end' },
  bgImageInner: { resizeMode: 'cover' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  landingCardOverlay: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  headerBackHit: { padding: 4, paddingRight: 8 },
  headerBackArrow: { fontSize: 22, color: '#222', fontWeight: '600' },
  headerBackPlaceholder: { width: 30 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#222' },
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
  paddingHorizontal: 32, // ensure >=4px horizontal gap inside button
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
  paddingVertical: 14, // increased padding to add clear top & bottom gap
  paddingHorizontal: 16, // increased padding to add clear side gaps
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  alignItems: 'center', // vertically center avatar & text block
  },
  cardCompact: { alignSelf: 'stretch' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0' },
  cardBody: { flex: 1, marginLeft: 14 },
  expertName: { fontSize: 16, fontWeight: '700', color: GREEN },
  expertRole: { fontSize: 13, fontWeight: '500', color: '#222', marginBottom: 6 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  ratingRight: { flexDirection: 'row', alignItems: 'center' },
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
  profileRole: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 10 },
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
  confirmTitle: { fontSize: 22, fontWeight: '700', color: GREEN, marginBottom: 12, textAlign: 'center' },
  confirmMsg: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center', marginBottom: 24, paddingHorizontal: 6 },
});

export default FieldVisitScreen;
