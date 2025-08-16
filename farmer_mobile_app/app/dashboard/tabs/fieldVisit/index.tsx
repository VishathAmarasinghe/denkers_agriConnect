// Officer Visit Services Flow Implementation
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground, Animated, Image, ScrollView, TextInput, useWindowDimensions, ActivityIndicator } from 'react-native';
import { images } from '@/constants';
import { APIService } from '@/utils/apiService';
import { ServiceBaseUrl } from '@/config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '@/slice/store';
import { showSnackbar } from '@/slice/snackbarSlice/snackbarSlice';
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

// Backend officer types
type Officer = {
  id: number;
  name: string;
  designation: string;
  specialization: 'general_support' | 'pest_control' | 'fertilizer_guidance';
  center: string;
  phone_no: string;
  description?: string;
};

// Map UI category to backend specialization
const CATEGORY_TO_SPEC: Record<CategoryKey, Officer['specialization']> = {
  'General Support': 'general_support',
  'Pest Control': 'pest_control',
  'Fertilizer Guidance': 'fertilizer_guidance',
};

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
  const dispatch = useAppDispatch();
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

  // Data state from backend
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchOfficers = async (reset = false) => {
    try {
      setLoading(true);
      const spec = CATEGORY_TO_SPEC[category];
      const params = { page: reset ? 1 : page, limit: 10, specialization: spec } as any;
      const url = `${ServiceBaseUrl}/api/v1/field-officers`;
      const res = await APIService.getInstance().get(url, { params });
      const payload = res.data?.data;
      const list: Officer[] = payload?.data || [];
      const pg = payload?.pagination;
      setOfficers(prev => (reset ? list : [...prev, ...list]));
      setTotalPages(pg?.totalPages || 1);
      if (reset) setPage(1);
    } catch (e: any) {
      dispatch(showSnackbar({ message: 'Failed to load officers', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // refetch on category change or when entering the list screen
  React.useEffect(() => {
    if (screen === Screen.ExpertsTabbed) {
      fetchOfficers(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, screen]);

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
            data={officers}
            keyExtractor={it => String(it.id)}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.expertCard}
                onPress={async () => {
                  // Fetch details by id for description
                  try {
                    const res = await APIService.getInstance().get(`${ServiceBaseUrl}/api/v1/field-officers/${item.id}`);
                    const data: Officer = res.data?.data || item;
                    const mapped: Expert = {
                      id: String(data.id),
                      name: data.name,
                      role: data.designation,
                      category,
                      phone: data.phone_no,
                      officeLocation: data.center,
                      rating: 4,
                      description: data.description || '',
                      hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
                    };
                    setSelected(mapped);
                  } catch {
                    const fallback: Expert = {
                      id: String(item.id),
                      name: item.name,
                      role: item.designation,
                      category,
                      phone: item.phone_no,
                      officeLocation: item.center,
                      rating: 4,
                      description: '',
                      hours: 'Mon - Fri • 8:30 AM - 3:30 PM',
                    };
                    setSelected(fallback);
                  }
                  push(Screen.Profile);
                }}
                accessibilityRole="button"
                accessibilityLabel={`View profile of ${item.name}`}
              >
                <Image source={images.appLogo} style={styles.expertAvatar} />
                <View style={styles.expertBody}>
                  <Text style={styles.expertName}>{item.name}</Text>
                  <Text style={styles.expertRole}>{item.designation}</Text>
                  <View style={styles.inlineRow}>
                    <View style={styles.phoneRow}>
                      <Text style={styles.iconText}>📞</Text>
                      <Text style={styles.metaText}>{item.phone_no}</Text>
                    </View>
                    <StarRating value={4} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 12 }} /> : null}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (!loading && page < totalPages) {
                setPage(p => p + 1);
              }
            }}
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
          <ContactFormInline
            onSubmit={async (payload) => {
              try {
                const token = await AsyncStorage.getItem('token');
                if (!selected) throw new Error('No officer selected');
                const urgency = payload.urgency === 'emergency' ? 'high' : payload.urgency === 'standard' ? 'medium' : 'low';
                const body = {
                  field_officer_id: Number(selected.id),
                  farmer_name: payload.name,
                  farmer_mobile: payload.mobile,
                  farmer_address: payload.address,
                  current_issues: payload.issues.join(', '),
                  urgency_level: urgency,
                };
                await APIService.getInstance().post(`${ServiceBaseUrl}/api/v1/field-officers/contact-requests`, body, {
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                dispatch(showSnackbar({ message: 'Request submitted', type: 'success' }));
                push(Screen.Confirmation);
              } catch (e: any) {
                dispatch(showSnackbar({ message: 'Failed to submit request', type: 'error' }));
              }
            }}
          />
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
  // Inline field errors
  errorInput: { borderColor: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: -6, marginBottom: 8 },
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

type ContactPayload = { name: string; mobile: string; address: string; issues: string[]; urgency: string };
const ContactFormInline: React.FC<{ onSubmit: (payload: ContactPayload) => void }> = ({ onSubmit }) => {
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [issues, setIssues] = React.useState<string[]>([]);
  const [urgency, setUrgency] = React.useState('standard');

  // Validation state
  const [touched, setTouched] = React.useState<{ name: boolean; mobile: boolean; address: boolean; issues: boolean }>({ name: false, mobile: false, address: false, issues: false });
  const [errors, setErrors] = React.useState<{ name?: string; mobile?: string; address?: string; issues?: string }>({});

  const validateName = (v: string) => {
    const value = v.trim();
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    return '';
  };
  const validateMobile = (v: string) => {
    const value = v.replace(/\s+/g, '');
    if (!value) return 'Mobile number is required';
    if (!/^\+?[0-9]{10}$/.test(value)) return 'Enter a valid mobile number (10 digits)';
    return '';
  };
  // Address optional; only warn if provided but too short
  const validateAddress = (v: string) => {
    const value = v.trim();
    if (!value) return '';
    if (value.length < 5) return 'Address must be at least 5 characters';
    return '';
  };
  const validateIssues = (arr: string[]) => {
    if (!arr || arr.length === 0) return 'Select at least one issue';
    return '';
  };

  const runValidation = (opts?: { touchAll?: boolean }) => {
    const nextErrors = {
      name: validateName(name),
      mobile: validateMobile(mobile),
      address: validateAddress(address),
      issues: validateIssues(issues),
    };
    setErrors(nextErrors);
    if (opts?.touchAll) setTouched({ name: true, mobile: true, address: true, issues: true });
    const isValid = !nextErrors.name && !nextErrors.mobile && !nextErrors.issues; // address not required
    return isValid;
  };

  const toggleIssue = (val: string) => {
    setIssues(prev => {
      const next = prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val];
      if (touched.issues) setErrors(e => ({ ...e, issues: validateIssues(next) }));
      return next;
    });
  };
  const canSubmit = React.useMemo(() => {
    const nameErr = validateName(name);
    const mobileErr = validateMobile(mobile);
    const issuesErr = validateIssues(issues);
    return !nameErr && !mobileErr && !issuesErr;
  }, [name, mobile, issues]);
  return (
    <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Contact Expert</Text>
        <TextInput
          placeholder="Your Name"
          style={[inputStyle, touched.name && errors.name ? styles.errorInput : null]}
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (touched.name) setErrors(e => ({ ...e, name: validateName(t) }));
          }}
          onBlur={() => {
            setTouched(prev => ({ ...prev, name: true }));
            setErrors(e => ({ ...e, name: validateName(name) }));
          }}
        />
        {touched.name && errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <TextInput
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          style={[inputStyle, touched.mobile && errors.mobile ? styles.errorInput : null]}
          value={mobile}
          onChangeText={(t) => {
            setMobile(t);
            if (touched.mobile) setErrors(e => ({ ...e, mobile: validateMobile(t) }));
          }}
          onBlur={() => {
            setTouched(prev => ({ ...prev, mobile: true }));
            setErrors(e => ({ ...e, mobile: validateMobile(mobile) }));
          }}
        />
        {touched.mobile && errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}

        <TextInput
          placeholder="Address (optional)"
          style={[inputStyle, touched.address && errors.address ? styles.errorInput : null]}
          value={address}
          onChangeText={(t) => {
            setAddress(t);
            if (touched.address) setErrors(e => ({ ...e, address: validateAddress(t) }));
          }}
          onBlur={() => {
            setTouched(prev => ({ ...prev, address: true }));
            setErrors(e => ({ ...e, address: validateAddress(address) }));
          }}
        />
        {touched.address && errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
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
        {touched.issues && errors.issues ? <Text style={styles.errorText}>{errors.issues}</Text> : null}
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
        <Button
          label="Submit"
          disabled={!canSubmit}
          onPress={() => {
            const ok = runValidation({ touchAll: true });
            if (!ok) return;
            onSubmit({ name: name.trim(), mobile: mobile.replace(/\s+/g, ''), address: address.trim(), issues, urgency });
          }}
        />
      </View>
    </ScrollView>
  );
};

const inputStyle = { marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: GREEN_LIGHT, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#222' } as const;
export default FieldVisitScreen;
