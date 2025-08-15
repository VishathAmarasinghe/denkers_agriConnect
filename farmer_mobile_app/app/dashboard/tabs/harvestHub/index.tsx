import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity, TextInput, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
import Button from '@/components/ui/Button';
import { images } from '@/constants';
import { Colors } from '@/constants/Colors';

// Screens
enum Screen {
  Landing,
  Warehouses,
  WarehouseDetail,
  Inventory,
  MarketPrices,
  SlotCalendar,
  BookingForm,
  BookingConfirmation,
}

// Data types
type Category = 'Paddy' | 'Vegetables' | 'Grains';
type Warehouse = {
  id: string;
  name: string;
  location: string;
  availability: 'Open' | 'Close';
  contact: string;
  photos: ImageSourcePropType[];
  space: string;
  temperature: string;
  humidity: string;
  security: string;
  category: Category;
};

type Inventory = {
  id: string;
  product: string;
  quantity: string;
  storedDate: string;
  location: string;
  owner: string;
  condition: 'Excellent' | 'Good' | 'Fair';
};
// type Price removed with Market Prices section

// Sample Data (placeholder)
const CATEGORIES: Category[] = ['Paddy', 'Vegetables', 'Grains'];
const WAREHOUSES: Warehouse[] = [
  {
    id: 'w1',
    name: 'Mithihalē Warehouse - 01',
    location: '4th Mile post, Kalutara',
    availability: 'Open',
    contact: '071-2345678',
    photos: [
      { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' },
      { uri: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop' },
      images.landingPageImage,
    ],
    space: 'Available: 0.75t (max 1.0t)',
    temperature: 'Between 23°C and 25°C (+/- 0.5°C)',
    humidity: 'High humidity (Stored 60–65%)',
    security: '24/7 CCTV and guard',
    category: 'Paddy',
  },
  {
    id: 'w2',
    name: 'LL Warehouse - 02',
    location: '2nd Street, Matara',
    availability: 'Close',
    contact: '071-9876543',
    photos: [
      { uri: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop' },
      { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' },
    ],
    space: 'Available: 0.25t (max 1.0t)',
    temperature: '24°C (+/- 1°C)',
    humidity: 'Low humidity (Stored 40–45%)',
    security: 'Secure access control',
    category: 'Vegetables',
  },
  {
    id: 'w3',
    name: 'Nimthihala Warehouse - 03',
    location: 'Agri Road, Galle',
    availability: 'Open',
    contact: '077-2223344',
    photos: [
      { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' },
      { uri: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop' },
    ],
    space: 'Available: 0.90t (max 1.2t)',
    temperature: '22–24°C',
    humidity: 'Moderate (50–55%)',
    security: 'Perimeter alarms',
    category: 'Grains',
  },
];

const INVENTORIES: Inventory[] = [
  {
    id: 'i1',
    product: 'Basmathi Rice',
    quantity: '2 450 kg',
    storedDate: '31 July 2025',
    location: 'Block A, Section 3',
    owner: 'Sunil Ediriweera, Mahawewa',
    condition: 'Good',
  },
  {
    id: 'i2',
    product: 'Keeri Samba Rice',
    quantity: '5 500 kg',
    storedDate: '28 July 2025',
    location: 'Block A, Section 1',
    owner: 'Kavindi Perera, Dankotuwa',
    condition: 'Excellent',
  },
  {
    id: 'i3',
    product: 'Nadu Rice',
    quantity: '1 250 kg',
    storedDate: '26 July 2025',
    location: 'Block B, Section 2',
    owner: 'Ruwan Fernando, Chilaw',
    condition: 'Good',
  },
];

// Market prices section removed
type Price = { id: string; product: string; price: string; change: number };
const MARKET_PRICES: Price[] = [
  { id: 'p1', product: 'Basmathi Rice', price: 'Rs. 120.00 (per kg)', change: +3.50 },
  { id: 'p2', product: 'Kiri Samba', price: 'Rs. 121.50 (per kg)', change: +1.50 },
  { id: 'p3', product: 'Rathu Kakulu', price: 'Rs. 118.00 (per kg)', change: 0.0 },
  { id: 'p4', product: 'Nadu Rice', price: 'Rs. 127.00 (per kg)', change: -3.00 },
  { id: 'p5', product: 'Suwandel Rice', price: 'Rs. 260.00 (per kg)', change: -10.50 },
];

export const options = { tabBarStyle: { display: 'none' } };

const GREEN = Colors.primary.main;
const GREEN_LIGHT = Colors.primary.light;

const HarvestHubScreen: React.FC = () => {
  const [screen, setScreen] = React.useState<Screen>(Screen.Landing);
  const [category, setCategory] = React.useState<Category>('Paddy');
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<Warehouse | null>(null);
  const [heroIndex, setHeroIndex] = React.useState<number>(0);
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const filtered = React.useMemo(() => WAREHOUSES.filter(w => w.category === category), [category]);

  // Reset hero image when selected warehouse changes
  React.useEffect(() => {
    setHeroIndex(0);
  }, [selectedWarehouse?.id]);

  // Calendar helpers (reuse logic from Machine Rent)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };
  const isDateUnavailable = (date: Date) => {
    return date.getDate() === 13 && date.getMonth() === 7; // sample: Aug 13 unavailable
  };
  const isCurrentDate = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };
  const isDateSelected = (date: Date) => selectedDates.some(d => d.toDateString() === date.toDateString());
  const navigateMonth = (dir: 'prev'|'next') => {
    const nm = new Date(currentMonth);
    nm.setMonth(nm.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentMonth(nm);
  };
  const handleDatePress = (date: Date) => {
    if (isDateDisabled(date) || isDateUnavailable(date)) return;
    const already = isDateSelected(date);
    if (already) {
      const remaining = selectedDates.filter(d => d.toDateString() !== date.toDateString());
      if (remaining.length === 0) return setSelectedDates([]);
      // keep the largest continuous range
      const sorted = [...remaining].sort((a,b)=>a.getTime()-b.getTime());
      const ranges: Date[][] = [];
      let cur: Date[] = [sorted[0]];
      for (let i=1;i<sorted.length;i++){
        const prev=sorted[i-1], now=sorted[i];
        const diff=(now.getTime()-prev.getTime())/(1000*60*60*24);
        if(diff===1) cur.push(now); else { ranges.push(cur); cur=[now]; }
      }
      ranges.push(cur);
      const largest = ranges.reduce((a,c)=>c.length>a.length?c:a, ranges[0]);
      setSelectedDates(largest);
    } else {
      const all=[...selectedDates, date].sort((a,b)=>a.getTime()-b.getTime());
      const filled: Date[] = [];
      for(let i=0;i<all.length;i++){
        filled.push(all[i]);
        if(i<all.length-1){
          const cur=all[i], next=all[i+1];
          const diff=(next.getTime()-cur.getTime())/(1000*60*60*24);
          for(let d=1; d<diff; d++){
            const mid=new Date(cur); mid.setDate(cur.getDate()+d);
            if(!isDateDisabled(mid) && !isDateUnavailable(mid)) filled.push(mid);
          }
        }
      }
      // unique & sorted
      const unique = filled.sort((a,b)=>a.getTime()-b.getTime()).filter((dt,i,arr)=> i===0 || dt.getTime()!==arr[i-1].getTime());
      setSelectedDates(unique);
    }
  };
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const formatMonthYear = (date: Date) => `${months[date.getMonth()]} ${date.getFullYear()}`;
  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return '';
    const sorted=[...selectedDates].sort((a,b)=>a.getTime()-b.getTime());
    const s=sorted[0], e=sorted[sorted.length-1];
    if (s.getTime()===e.getTime()) return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  };

  // Render blocks
  const Landing = (
    <View style={styles.landingRoot}>
      <ImageBackground source={images.harvestHubLandingImage} style={styles.bgImage} imageStyle={styles.bgImageInner}>
        <View style={styles.bgOverlay} />
        <View style={styles.landingCardOverlay}>
          <Text style={styles.title}>Store Your Harvest, Secure Your Income</Text>
          <Text style={styles.subtitle}>
            Reserve clean, safe, and climate-controlled warehouse space to protect your crops. Enjoy flexible storage duration, easy access, and reliable handling to keep your harvest in top condition until it’s ready to be sent to the market.
          </Text>
          <Button label="Visit Warehouse" onPress={() => setScreen(Screen.Warehouses)} />
        </View>
      </ImageBackground>
    </View>
  );

  const Warehouses = (
    <View style={styles.flex}>
      <SMHeader
        title="Warehouses"
        onBack={() => setScreen(Screen.Landing)}
        right={
          <TouchableOpacity style={smHeaderStyles.miniBtn} onPress={() => setScreen(Screen.MarketPrices)}>
            <Ionicons name={"trending-up-outline" as any} size={16} color={Colors.primary.contrastText} style={smHeaderStyles.miniBtnIcon} />
            <Text style={smHeaderStyles.miniBtnText}>Market</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.tabRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.tab, category === cat && styles.tabActive]} onPress={() => setCategory(cat)}>
            <Text numberOfLines={2} style={[styles.tabText, category === cat && styles.tabTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
        {filtered.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => { setSelectedWarehouse(item); setScreen(Screen.WarehouseDetail); }}>
            <Image source={item.photos[0]} style={styles.thumb} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.location}</Text>
              <View style={styles.inlineRow}>
                <Text style={[styles.badge, item.availability === 'Open' ? styles.badgeOpen : styles.badgeClose]}>{item.availability}</Text>
                <Text style={styles.cardMeta}>Contact: {item.contact}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const WarehouseDetail = selectedWarehouse && (
    <View style={styles.flex}>
      <SMHeader title="Warehouses" onBack={() => setScreen(Screen.Warehouses)} />
      <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
        <Image source={selectedWarehouse.photos[heroIndex]} style={styles.detailHero} />
        <View style={styles.thumbRow}>
          {selectedWarehouse.photos.map((ph, idx) => (
            <TouchableOpacity key={idx} onPress={() => setHeroIndex(idx)} activeOpacity={0.8}>
              <Image source={ph} style={[styles.smallThumb, idx === heroIndex && styles.smallThumbSelected]} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.detailTitle}>{selectedWarehouse.name}</Text>
        <Text style={styles.detailSub}>{selectedWarehouse.location}</Text>

        <View style={styles.infoStrip}><Text style={styles.infoLabel}>Space</Text><Text style={styles.infoValue}>{selectedWarehouse.space}</Text></View>
        <View style={styles.infoStrip}><Text style={styles.infoLabel}>Temperature</Text><Text style={styles.infoValue}>{selectedWarehouse.temperature}</Text></View>
        <View style={styles.infoStrip}><Text style={styles.infoLabel}>Humidity</Text><Text style={styles.infoValue}>{selectedWarehouse.humidity}</Text></View>
        <View style={styles.infoStrip}><Text style={styles.infoLabel}>Security</Text><Text style={styles.infoValue}>{selectedWarehouse.security}</Text></View>

        <View style={styles.rowGap}>
          <Button label="View Inventory" variant="outline" onPress={() => setScreen(Screen.Inventory)} />
          <Button label="Book Slot" onPress={() => setScreen(Screen.SlotCalendar)} />
        </View>
      </ScrollView>
    </View>
  );

  const InventoryList = (
    <View style={styles.flex}>
      <SMHeader title="Inventories" onBack={() => setScreen(Screen.WarehouseDetail)} />
      <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
        <View style={styles.invHeaderBlock}>
          <Text style={styles.invSectionTitle}>Stored Products</Text>
          <Text style={styles.invSectionDesc}>
            Complete list of all products all have stored in this warehouse with quantities, storage dates, and current status.
          </Text>
        </View>

        {INVENTORIES.map(inv => (
          <View key={inv.id} style={styles.inventoryCard}>
            <View style={styles.invCardHead}>
              <Text style={styles.invTitle}>{inv.product}</Text>
              <View style={styles.conditionWrap}>
                <Ionicons name="checkmark-circle-outline" size={16} color={GREEN} />
                <Text style={styles.conditionText}>{inv.condition} Condition</Text>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <View style={styles.valueBox}><Text style={styles.valueText}>{inv.quantity}</Text></View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Location</Text>
              <View style={styles.valueBox}><Text style={styles.valueText}>{inv.location}</Text></View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Stored Date</Text>
              <View style={styles.valueBox}><Text style={styles.valueText}>{inv.storedDate}</Text></View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Product Owner</Text>
              <View style={styles.valueBox}><Text style={styles.valueText}>{inv.owner}</Text></View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const MarketPrices = (
    <View style={styles.flex}>
      <SMHeader title="Market Prices" onBack={() => setScreen(Screen.Warehouses)} />
      <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
        <View style={styles.invHeaderBlock}>
          <Text style={styles.invSectionTitle}>Today's Paddy Market Rates</Text>
          <Text style={styles.invSectionDesc}>
            Current market prices for all paddy varieties with daily price changes and trend indicators.
          </Text>
        </View>

        {MARKET_PRICES.map(mp => {
          const up = mp.change > 0;
          const down = mp.change < 0;
          const deltaColor = up ? styles.deltaUp.color : down ? styles.deltaDown.color : Colors.text.secondary;
          const arrowName = up ? 'trending-up-outline' : down ? 'trending-down-outline' : 'remove-outline';
          const deltaText = `${mp.change > 0 ? '+' : ''}${mp.change.toFixed(2)} (Rs.)`;
          return (
            <View key={mp.id} style={styles.inventoryCard}>
              <View style={styles.invCardHead}>
                <Text style={styles.invTitle}>{mp.product}</Text>
                <View style={styles.conditionWrap}>
                  <Ionicons name={arrowName as any} size={16} color={deltaColor} />
                  <Text style={[styles.delta, up ? styles.deltaUp : down ? styles.deltaDown : styles.deltaNeutral]}>{deltaText}</Text>
                </View>
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Current Price</Text>
                <View style={styles.valueBox}><Text style={styles.valueText}>{mp.price}</Text></View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const SlotCalendar = (
    <View style={styles.flex}>
      <SMHeader title="Book a Slot" onBack={() => setScreen(Screen.WarehouseDetail)} />
      <View style={styles.calendarWrap}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.calNavBtn}>
            <Ionicons name="chevron-back" size={18} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarRow}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (<Text key={d} style={styles.calendarHead}>{d}</Text>))}
        </View>
        <View style={styles.calendarGrid}>
          {(() => {
            const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
            const nodes: React.ReactNode[] = [];
            for (let i=0;i<startingDay;i++) nodes.push(<View key={`e-${i}`} style={styles.dayCell} />);
            for (let day=1; day<=daysInMonth; day++){
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const disabled = isDateDisabled(date);
              const unavailable = isDateUnavailable(date);
              const current = isCurrentDate(date);
              const selected = isDateSelected(date);
              const cellStyle = [styles.dayCell,
                disabled ? styles.dayDisabled : unavailable ? styles.dayUnavailable : selected ? styles.daySelected : current ? styles.dayCurrent : styles.dayDefault
              ];
              const textStyle = [styles.dayText,
                disabled ? styles.dayTextDisabled : unavailable ? styles.dayTextUnavailable : selected ? styles.dayTextSelected : current ? styles.dayTextCurrent : styles.dayTextDefault
              ];
              nodes.push(
                <TouchableOpacity key={`d-${day}`} disabled={disabled || unavailable} onPress={() => handleDatePress(date)} style={cellStyle}>
                  <Text style={textStyle}>{day}</Text>
                </TouchableOpacity>
              );
            }
            return nodes;
          })()}
        </View>
        {selectedDates.length>0 && (
          <Text style={[styles.cardMeta,{marginTop:12}]}>Selected: {formatSelectedDates()}</Text>
        )}
      </View>
      <View style={styles.padH}>
        <CustomButton title="Next" onPress={() => setScreen(Screen.BookingForm)} variant="primary" size="large" fullWidth={true} disabled={selectedDates.length===0} />
      </View>
    </View>
  );

  const BookingForm = (
    <View style={styles.flex}>
      <SMHeader title="Book Storage Slot" onBack={() => setScreen(Screen.SlotCalendar)} />
      <ScrollView contentContainerStyle={styles.formPad}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Provide Your Details</Text>
          {selectedDates.length>0 && (
            <Text style={[styles.cardMeta,{textAlign:'center', marginBottom: 12}]}>Selected: {formatSelectedDates()}</Text>
          )}
          <TextInput placeholder="Enter Your Name" style={inputStyle} />
          <TextInput placeholder="Enter Your Address" style={inputStyle} />
          <TextInput placeholder="Enter Your Phone Number" style={inputStyle} keyboardType="phone-pad" />
          <View style={{ marginTop: 6 }}>
            <CustomButton title="Book Time" onPress={() => setScreen(Screen.BookingConfirmation)} variant="primary" size="large" fullWidth={true} />
          </View>
          <View style={{ marginTop: 8 }}>
            <CustomButton title="Cancel" onPress={() => setScreen(Screen.WarehouseDetail)} variant="secondary" size="large" fullWidth={true} />
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const BookingConfirmation = (
    <View style={styles.flex}>
      <SMHeader title="" onBack={() => setScreen(Screen.Warehouses)} />
      <View style={styles.confirmCard}>
        <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
        <Text style={styles.confirmTitle}>Your storage slot is confirmed!</Text>
        <Text style={styles.confirmMsg}>Your warehouse deposit slot is reserved. Please arrive on time with your items and present the confirmation at the desk for quick processing.</Text>
        <Button label="Finish" onPress={() => setScreen(Screen.Warehouses)} />
      </View>
    </View>
  );

  let content: React.ReactNode = null;
  switch (screen) {
    case Screen.Landing: content = Landing; break;
    case Screen.Warehouses: content = Warehouses; break;
    case Screen.WarehouseDetail: content = WarehouseDetail; break;
    case Screen.Inventory: content = InventoryList; break;
  case Screen.MarketPrices: content = MarketPrices; break;
    case Screen.SlotCalendar: content = SlotCalendar; break;
    case Screen.BookingForm: content = BookingForm; break;
    case Screen.BookingConfirmation: content = BookingConfirmation; break;
  }

  return <View style={styles.screenRoot}>{content}</View>;
};

// Soil Management–style header (chevron back, centered title, placeholder right)
const SMHeader: React.FC<{ title: string; onBack?: () => void; right?: React.ReactNode }> = ({ title, onBack, right }) => (
  <View style={smHeaderStyles.header}>
    {onBack ? (
      <TouchableOpacity style={smHeaderStyles.backButton} onPress={onBack}>
        <View style={smHeaderStyles.backCircle}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </View>
      </TouchableOpacity>
    ) : (
      <View style={smHeaderStyles.placeholder} />
    )}
    <Text style={smHeaderStyles.headerTitle}>{title}</Text>
  {right ? right : <View style={smHeaderStyles.placeholder} />}
  </View>
);

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: Colors.background.default },
  flex: { flex: 1, backgroundColor: Colors.background.default, paddingHorizontal: 16, paddingTop: 12 },
  // Landing
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
  title: { fontSize: 22, fontWeight: '700', color: GREEN, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, color: Colors.text.secondary, textAlign: 'center', marginBottom: 18 },
  // headerLink removed; Soil Management header doesn’t use right action here

  // Tabs & list
  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tab: { flex: 1, marginHorizontal: 4, backgroundColor: GREEN_LIGHT, paddingHorizontal: 8, paddingVertical: 6, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: GREEN },
  tabText: { fontSize: 13, fontWeight: '600', color: GREEN, paddingHorizontal: 4, textAlign: 'center', lineHeight: 16 },
  tabTextActive: { color: Colors.primary.contrastText },
  listPad: { paddingBottom: 32, paddingHorizontal: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },

  // Cards
  card: { flexDirection: 'row', backgroundColor: Colors.background.default, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  thumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#E0E0E0' },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: GREEN },
  cardMeta: { fontSize: 13, color: Colors.text.secondary },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 12, overflow: 'hidden', color: Colors.text.primary },
  badgeOpen: { backgroundColor: GREEN_LIGHT, color: GREEN },
  badgeClose: { backgroundColor: '#FEE2E2', color: '#B91C1C' },

  // Detail
  detailScroll: { padding: 16 },
  detailHero: { width: '100%', height: 200, borderRadius: 16, marginBottom: 10 },
  thumbRow: { flexDirection: 'row', marginBottom: 10 },
  smallThumb: { width: 56, height: 56, borderRadius: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  smallThumbSelected: { borderColor: GREEN },
  detailTitle: { fontSize: 18, fontWeight: '700', color: GREEN, marginTop: 6 },
  detailSub: { fontSize: 13, color: Colors.text.secondary, marginBottom: 8 },
  infoStrip: { backgroundColor: GREEN_LIGHT, borderRadius: 12, padding: 12, marginBottom: 10 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: '#000' },
  infoValue: { fontSize: 13, color: '#000' },
  rowGap: { marginTop: 6, gap: 10 },

  // Inventory
  invHeaderBlock: { paddingHorizontal: 4, marginBottom: 10 },
  invSectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  invSectionDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 4 },
  inventoryCard: {
    backgroundColor: Colors.background.default,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  invCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  invTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  conditionWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  conditionText: { fontSize: 12, color: Colors.text.primary },
  delta: { fontSize: 12, fontWeight: '700' },
  deltaUp: { color: '#22C55E' },
  deltaDown: { color: '#EF4444' },
  deltaNeutral: { color: Colors.text.secondary },
  fieldBlock: { marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  valueBox: { backgroundColor: '#E9ECEF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  valueText: { fontSize: 13, color: Colors.text.primary },

  // Market styles removed

  // Calendar
  calendarWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  calNavBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  calendarHead: { width: 40, textAlign: 'center', fontSize: 12, color: Colors.text.secondary },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  dayAvailable: { backgroundColor: GREEN_LIGHT },
  dayDefault: { backgroundColor: 'transparent' },
  dayCurrent: { borderWidth: 2, borderColor: GREEN, backgroundColor: 'transparent' },
  daySelected: { backgroundColor: GREEN },
  dayUnavailable: { backgroundColor: '#FEE2E2' },
  dayDisabled: { backgroundColor: '#F3F4F6' },
  dayText: { fontSize: 12, color: Colors.text.primary },
  dayTextDefault: { color: Colors.text.primary },
  dayTextCurrent: { color: Colors.text.primary, fontWeight: '700' },
  dayTextSelected: { color: Colors.primary.contrastText, fontWeight: '700' },
  dayTextUnavailable: { color: '#B91C1C' },
  dayTextDisabled: { color: '#9CA3AF' },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  slotChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: GREEN_LIGHT },
  slotText: { color: GREEN, fontWeight: '600' },
  padH: { paddingHorizontal: 16, paddingBottom: 16 },

  // Form
  formPad: { padding: 16 },
  formCard: { backgroundColor: Colors.background.default, borderRadius: 22, padding: 24, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: GREEN, marginBottom: 12, textAlign: 'center' },

  // Confirmation
  confirmCard: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.default, padding: 24 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: GREEN_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  checkMark: { fontSize: 38, fontWeight: '700', color: GREEN },
  confirmTitle: { fontSize: 20, fontWeight: '700', color: GREEN, marginBottom: 12, textAlign: 'center' },
  confirmMsg: { fontSize: 14, lineHeight: 20, color: Colors.text.secondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 6 },
});

const inputStyle = { marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: GREEN_LIGHT, backgroundColor: Colors.background.default, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: Colors.text.primary } as const;

export default HarvestHubScreen;

const smHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 12,
    backgroundColor: 'white',
  // outline removed per design feedback
  },
  backButton: { padding: 4, paddingRight: 8 },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  placeholder: { width: 40 },
  miniBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.primary.main, flexDirection: 'row', alignItems: 'center' },
  miniBtnText: { color: Colors.primary.contrastText, fontSize: 12, fontWeight: '700' },
  miniBtnIcon: { marginRight: 6 },
});
