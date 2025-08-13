// Officer Visit Services Flow Implementation
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground, Animated, Image, ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { images } from '@/constants';
// (Temporarily using local types until extracted to shared location)

// Generic UI components (reusable across app)
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { FormCheckbox } from '@/components/ui/FormCheckbox';
import { FormRadio } from '@/components/ui/FormRadio';

// Local types (should be moved to shared types file later for reuse)
type CategoryKey = 'General Support' | 'Pest Control' | 'Fertilizer Guidance';
interface Expert {
  id: string;
  name: string;
  role: string;
  category: CategoryKey;
  photo?: any;
  avatarUrl?: string;
  phone: string;
  officeLocation: string;
  rating: number;
  description: string;
  hours: string;
}
const CATEGORIES: CategoryKey[] = ['General Support', 'Pest Control', 'Fertilizer Guidance'];

// Static data (placeholder assets; content intentionally feature-specific here; UI components stay generic)
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

// Screen State Enum
enum Screen {
  Landing,
  ExpertsTabbed,
  FilteredSingle, // retained for potential future use but no longer navigated to
  Profile,
  ContactForm,
  Confirmation,
}


// Main Component
export const options = {
  tabBarStyle: { display: 'none' },
};

const FieldVisitScreen: React.FC = () => {
  // Navigation stack to emulate auth (expo-router) push/pop slide transitions
  const [stack, setStack] = useState<Screen[]>([Screen.Landing]);
  const screen = stack[stack.length - 1];
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back' | 'replace'>('forward');
  const [category, setCategory] = useState<CategoryKey>('General Support');
  const [selected, setSelected] = useState<Expert | null>(null);
  const [prevSelected, setPrevSelected] = useState<Expert | null>(null); // snapshot for profile during back
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;   // landing intro
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current; // landing intro
  // Use current window width (responsive & orientation-aware)
  const { width } = useWindowDimensions();
  const incomingTx = React.useRef(new Animated.Value(0)).current;
  const outgoingTx = React.useRef(new Animated.Value(0)).current;
  const incomingOpacity = React.useRef(new Animated.Value(1)).current;
  const outgoingOpacity = React.useRef(new Animated.Value(0)).current;

  const filteredExperts = useMemo(() => EXPERTS.filter(e => e.category === category), [category]);

  // Navigation helpers mimicking push/pop
  const push = (next: Screen) => {
    setPrevScreen(screen);
    setDirection('forward');
    setPrevSelected(selected);
    setStack(prev => [...prev, next]);
  };
  const pop = () => {
    if (stack.length > 1) {
      setPrevScreen(screen);
      setDirection('back');
      setPrevSelected(selected);
      setStack(prev => prev.slice(0, prev.length - 1));
    }
  };
  const replaceAll = (next: Screen) => {
    setPrevScreen(screen);
    setDirection('replace');
    setPrevSelected(null);
    setStack([next]);
  };

  // Run fade + scale once on mount (as per provided snippet)
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  // Slide transition on stack change
  React.useEffect(() => {
    if (prevScreen !== null) {
      // Set initial states depending on direction
      const fromRight = direction === 'forward' || direction === 'replace';
      incomingTx.setValue(fromRight ? width : -width);
      outgoingTx.setValue(0);
      incomingOpacity.setValue(1);
      outgoingOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(outgoingTx, { toValue: fromRight ? -width * 0.25 : width * 0.25, duration: 320, useNativeDriver: true }),
        Animated.timing(incomingTx, { toValue: 0, duration: 340, useNativeDriver: true }),
        Animated.timing(outgoingOpacity, { toValue: 0.3, duration: 320, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setPrevScreen(null); });
    }
  }, [stack.length]);

  let content: React.ReactNode = null;
  switch (screen) {
    case Screen.Landing:
      content = (
        <View style={styles.landingRoot}>
          <ImageBackground source={images.officerVisitLandingImage} style={styles.bgImage} imageStyle={styles.bgImageInner}>
            <View style={styles.bgOverlay} />
            <Animated.View style={[styles.landingCardOverlay, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.appTitle}>Connect with</Text>
              <Text style={styles.appTitle}>Agricultural Experts</Text>
              <Text style={styles.appSubtitle}>Get personalized agricultural advice from certified field officers. Choose from general farm support, pest control consultation, or fertilizer guidance - all delivered at your convenience.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => push(Screen.ExpertsTabbed)} accessibilityRole="button" accessibilityLabel="Connect with experts">
                <Text style={styles.primaryBtnText}>Connect Experts</Text>
              </TouchableOpacity>
            </Animated.View>
          </ImageBackground>
        </View>
      );
      break;
    case Screen.ExpertsTabbed:
      content = (
        <View style={styles.flex}>
          <Header title="Experts" onBack={() => pop()} />
          <View style={styles.tabRow}>
            {CATEGORIES.map(cat => {
              const isLong = cat.length > 15;
              return (
                <TouchableOpacity key={cat} style={[styles.tab, category === cat && styles.tabActive]} onPress={() => setCategory(cat)} accessibilityRole="button" accessibilityLabel={`Filter experts by ${cat}`}>
                  <Text numberOfLines={2} style={[styles.tabText, isLong && styles.tabTextLong, category === cat && styles.tabTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <FlatList
            data={filteredExperts}
            keyExtractor={it => it.id}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.expertCard}
                onPress={() => { setSelected(item); push(Screen.Profile); }}
                accessibilityRole="button"
                accessibilityLabel={`View profile of ${item.name}`}
              >
                <Image source={item.avatarUrl ? { uri: item.avatarUrl } : (item.photo || images.appLogo)} style={styles.expertAvatar} />
                <View style={styles.expertBody}>
                  <Text style={styles.expertName}>{item.name}</Text>
                  <Text style={styles.expertRole}>{item.role}</Text>
                  <View style={styles.inlineRow}>
                    <View style={styles.phoneRow}>
                      <Text style={styles.iconText}>📞</Text>
                      <Text style={styles.metaText}>{item.phone}</Text>
                    </View>
                    <StarRating value={item.rating} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      );
      break;
    case Screen.Profile:
      if (selected) {
        content = (
          <View style={styles.flex}>
            <Header title="Experts Profile" onBack={() => { setSelected(null); pop(); }} />
            <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.profileCard}>
                <Image source={selected.avatarUrl ? { uri: selected.avatarUrl } : (selected.photo || images.appLogo)} style={styles.profilePhoto} />
                <Text style={styles.profileName}>{selected.name}</Text>
                <Text style={styles.profileRole}>{selected.role}</Text>
                <Text style={styles.profileDesc}>{selected.description}</Text>
                <View style={styles.metaRow}><Text style={styles.iconText}>📞</Text><Text style={styles.metaText}>{selected.phone}</Text></View>
                <View style={styles.metaRow}><Text style={styles.iconText}>⏰</Text><Text style={styles.metaText}>{selected.hours}</Text></View>
                <View style={styles.metaRow}><Text style={styles.iconText}>📍</Text><Text style={styles.metaText}>{selected.officeLocation}</Text></View>
                <View style={styles.infoStrip}>
                  <Text style={styles.infoStripTitle}>Request Farm Visit</Text>
                  <Text style={styles.infoStripText}>Get on-site assessment and personalized guidance to improve yield and reduce risks.</Text>
                </View>
                <Button label="Contact Me" onPress={() => push(Screen.ContactForm)} />
              </View>
            </ScrollView>
          </View>
        );
      }
      break;
    case Screen.ContactForm:
      content = (
        <View style={styles.flex}>
          <Header title="Contact" onBack={() => pop()} />
          <ContactFormInline onSubmit={() => push(Screen.Confirmation)} />
        </View>
      );
      break;
    case Screen.Confirmation:
      content = (
        <View style={styles.flex}>
          <Header title="" onBack={() => { setSelected(null); replaceAll(Screen.Landing); }} />
          <View style={styles.confirmCard}>
            <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
            <Text style={styles.confirmTitle}>Request Submitted Successfully!</Text>
            <Text style={styles.confirmMsg}>Your field visit request has been successfully submitted! Our agricultural officer will review your concerns and contact you within 24 hours to discuss available time slots and schedule the farm visit.</Text>
            <Button label="Finish" onPress={() => { setSelected(null); replaceAll(Screen.Landing); }} />
          </View>
        </View>
      );
      break;
  }

  // Render previous screen (snapshot) if animating
  const renderPrev = () => {
    if (prevScreen === null) return null;
    // Minimal snapshot without re-running landing intro animation to avoid jump
    let prevContent: React.ReactNode = null;
    if (prevScreen === Screen.Landing) {
      prevContent = (
        <View style={styles.landingRoot}>
          <ImageBackground source={images.officerVisitLandingImage} style={styles.bgImage} imageStyle={styles.bgImageInner}>
            <View style={styles.bgOverlay} />
            <View style={styles.landingCardOverlay}>
              <Text style={styles.appTitle}>Connect with</Text>
              <Text style={styles.appTitle}>Agricultural Experts</Text>
              <Text style={styles.appSubtitle}>Get personalized agricultural advice from certified field officers. Choose from general farm support, pest control consultation, or fertilizer guidance - all delivered at your convenience.</Text>
              <View style={[styles.primaryBtn, styles.primaryBtnFaded]}> 
                <Text style={styles.primaryBtnText}>Connect Experts</Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      );
    } else if (prevScreen === Screen.ExpertsTabbed) {
      prevContent = (
        <View style={styles.flex}>
          <Header title="Experts" />
          <View style={styles.tabRow}>
            {CATEGORIES.map(cat => {
              const isLong = cat.length > 15;
              return (
                <View key={cat} style={[styles.tab, category === cat && styles.tabActive]}>
                  <Text numberOfLines={2} style={[styles.tabText, isLong && styles.tabTextLong, category === cat && styles.tabTextActive]}>{cat}</Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    } else if (prevScreen === Screen.Profile && prevSelected) {
      prevContent = (
        <View style={styles.flex}>
          <Header title="Experts Profile" />
          <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
              <Image source={prevSelected.avatarUrl ? { uri: prevSelected.avatarUrl } : (prevSelected.photo || images.appLogo)} style={styles.profilePhoto} />
              <Text style={styles.profileName}>{prevSelected.name}</Text>
              <Text style={styles.profileRole}>{prevSelected.role}</Text>
              <Text style={styles.profileDesc}>{prevSelected.description}</Text>
            </View>
          </ScrollView>
        </View>
      );
    }
    return (
      <Animated.View style={[styles.transitionWrap, styles.absoluteFill, { transform: [{ translateX: outgoingTx }], opacity: outgoingOpacity }]}> 
        {prevContent}
      </Animated.View>
    );
  };

  return (
    <View style={styles.screenRoot}>
      {renderPrev()}
      <Animated.View style={[styles.transitionWrap, { transform: [{ translateX: incomingTx }], opacity: incomingOpacity }]}> 
        {content}
      </Animated.View>
    </View>
  );
};

// Styles
// Local palette (consider centralizing later)
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
  paddingHorizontal: 16, // ensure >=4px horizontal gap inside button
    alignItems: 'center',
    marginTop: 6,
  marginHorizontal: 16, // consistent outer horizontal margin
  },
  primaryBtnFaded: { opacity: 0.85 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 10,
    paddingVertical: 12,
  paddingHorizontal: 16, // ensure consistent horizontal spacing
    alignItems: 'center',
    marginTop: 12,
  marginHorizontal: 16,
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
  screenRoot: { flex: 1, backgroundColor: '#fff' },
  transitionWrap: { flex: 1, backgroundColor: '#fff' },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Expert card inline styles
  expertCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  expertAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0' },
  expertBody: { flex: 1, marginLeft: 14 },
  expertName: { fontSize: 16, fontWeight: '700', color: GREEN },
  expertRole: { fontSize: 13, fontWeight: '500', color: '#222', marginBottom: 6 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  iconText: { fontSize: 16, marginRight: 4 },
  metaText: { fontSize: 13, color: '#444' },
  // Profile
  profileScroll: { padding: 16 },
  profileCard: { backgroundColor: '#fff', borderRadius: 22, padding: 26, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, alignItems: 'center' },
  profilePhoto: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0E0E0', marginBottom: 12 },
  profileName: { fontSize: 20, fontWeight: '700', color: GREEN },
  profileRole: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 10 },
  profileDesc: { fontSize: 14, lineHeight: 20, color: '#444', textAlign: 'center', marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoStrip: { backgroundColor: GREEN_LIGHT, borderRadius: 12, padding: 14, width: '100%', marginTop: 12, marginBottom: 18 },
  infoStripTitle: { fontSize: 15, fontWeight: '700', color: GREEN, marginBottom: 4 },
  infoStripText: { fontSize: 13, lineHeight: 18, color: GREEN },
  // Contact form
  formScroll: { padding: 16 },
  formCard: { backgroundColor: '#fff', borderRadius: 22, padding: 24, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: GREEN, marginBottom: 12, textAlign: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: GREEN, marginBottom: 6 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  // Confirmation
  confirmCard: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: GREEN_LIGHTER, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  checkMark: { fontSize: 38, fontWeight: '700', color: GREEN },
  confirmTitle: { fontSize: 22, fontWeight: '700', color: GREEN, marginBottom: 12, textAlign: 'center' },
  confirmMsg: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center', marginBottom: 24, paddingHorizontal: 6 },

});

// Inline Contact Form using generic controls
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

const ContactFormInline: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [issues, setIssues] = React.useState<string[]>([]);
  const [urgency, setUrgency] = React.useState('standard');

  const toggleIssue = (val: string) => {
    setIssues(prev => (prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]));
  };
  const canSubmit = name.trim() && mobile.trim();
  return (
    <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Contact Expert</Text>
        <TextInput placeholder="Your Name" style={inputStyle} value={name} onChangeText={setName} />
        <TextInput placeholder="Mobile Number" keyboardType="phone-pad" style={inputStyle} value={mobile} onChangeText={setMobile} />
        <TextInput placeholder="Address" style={inputStyle} value={address} onChangeText={setAddress} />
        <Text style={styles.fieldLabel}>What issues are you facing?</Text>
        {ISSUE_OPTIONS.map(opt => (
          <FormCheckbox
            key={opt}
            label={opt}
            checked={issues.includes(opt)}
            onChange={() => toggleIssue(opt)}
            style={styles.choiceRow}
          />
        ))}
        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>How urgent is this issue?</Text>
        {URGENCY_OPTIONS.map(opt => (
          <FormRadio
            key={opt.value}
            label={opt.label}
            selected={urgency === opt.value}
            onSelect={() => setUrgency(opt.value)}
            style={styles.choiceRow}
          />
        ))}
        <Button label="Submit" disabled={!canSubmit} onPress={onSubmit} />
      </View>
    </ScrollView>
  );
};

const inputStyle = { marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: GREEN_LIGHT, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#222' } as const;
export default FieldVisitScreen;
