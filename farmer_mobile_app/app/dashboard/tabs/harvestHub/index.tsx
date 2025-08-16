import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity, TextInput, ImageSourcePropType, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
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
type TimeSlot = { id: string; label: string; available: boolean };

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

// Market Prices dataset and types
type Price = { id: string; product: string; price: string; change: number };
const MARKET_PRICES: Price[] = [
  { id: 'p1', product: 'Basmathi Rice', price: 'Rs. 120.00 (per kg)', change: +3.50 },
  { id: 'p2', product: 'Kiri Samba', price: 'Rs. 121.50 (per kg)', change: +1.50 },
  { id: 'p3', product: 'Rathu Kakulu', price: 'Rs. 118.00 (per kg)', change: 0.0 },
  { id: 'p4', product: 'Nadu Rice', price: 'Rs. 127.00 (per kg)', change: -3.00 },
  { id: 'p5', product: 'Suwandel Rice', price: 'Rs. 260.00 (per kg)', change: -10.50 },
];

// Base definitions for time slots (Morning session)
const BASE_MORNING_TIMES: string[] = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
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
  const [showDetailsForm, setShowDetailsForm] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', location: '', contactNumber: '' });
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
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
    // Single-date toggle behavior
    if (selectedDates.length === 1 && selectedDates[0].toDateString() === date.toDateString()) {
      setSelectedDates([]);
      setSelectedTimeSlot(null);
      return;
    }
    setSelectedDates([date]);
    setSelectedTimeSlot(null);
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
  const formatSingleSelectedDate = () => {
    if (selectedDates.length !== 1) return '';
    const d = selectedDates[0];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Dynamic slot helpers
  const hashString = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };
  const getMorningSlotsFor = (date: Date, warehouseId?: string | null): TimeSlot[] => {
    const seed = `${warehouseId ?? 'nw'}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const base = hashString(seed);
    // Make weekends a bit tighter: fewer available slots on Sundays
    const isSunday = date.getDay() === 0;
    return BASE_MORNING_TIMES.map((label, idx) => {
      const mod = (base + idx) % (isSunday ? 2 : 3);
      // For Sunday roughly 50% unavailable, on other days ~33% unavailable
      const available = mod !== 0;
      return { id: `ts${idx + 1}`, label, available };
    });
  };
  const morningSlots = React.useMemo(() => {
    if (selectedDates.length !== 1) return [] as TimeSlot[];
    return getMorningSlotsFor(selectedDates[0], selectedWarehouse?.id);
  }, [selectedDates, selectedWarehouse?.id]);

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
          <CustomButton
            title="Visit Warehouse"
            onPress={() => setScreen(Screen.Warehouses)}
            variant="primary"
            size="large"
            fullWidth={true}
          />
        </View>
      </ImageBackground>
    </View>
  );

  const Warehouses = (
    <View style={styles.flex}>
      <SMHeader
        title="Warehouses"
        onBack={() => setScreen(Screen.Landing)}
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

        <View style={{ alignItems: 'flex-end', marginTop: 4, marginBottom: 8 }}>
          <TouchableOpacity style={smHeaderStyles.miniBtn} onPress={() => setScreen(Screen.MarketPrices)}>
            <Ionicons name={"trending-up-outline" as any} size={16} color={Colors.primary.contrastText} style={smHeaderStyles.miniBtnIcon} />
            <Text style={smHeaderStyles.miniBtnText}>Market</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowGap}>
          <CustomButton
            title="View Inventory"
            variant="outline"
            size="large"
            fullWidth={true}
            onPress={() => setScreen(Screen.Inventory)}
          />
          <CustomButton
            title="Book Slot"
            variant="primary"
            size="large"
            fullWidth={true}
            onPress={() => setScreen(Screen.SlotCalendar)}
          />
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

  const parsePriceNum = (s: string) => {
    const m = s.match(/([0-9]+(?:\.[0-9]+)?)/);
    return m ? parseFloat(m[1]) : 0;
  };
  const toPriceStr = (n: number) => `Rs. ${n.toFixed(2)} (per kg)`;
  const getMarketPricesForWarehouse = (wh?: Warehouse | null): Price[] => {
    if (!wh) return MARKET_PRICES;
    return MARKET_PRICES.map((p, idx) => {
      const base = parsePriceNum(p.price);
      const seed = hashString(`${wh.id}-${idx}`);
      const offset = ((seed % 201) - 100) / 10; // -10.0 to +10.0
      const change = (((seed >> 3) % 301) - 150) / 10; // -15.0 to +15.0
      const price = Math.max(1, base + offset);
      return { id: p.id, product: p.product, price: toPriceStr(price), change };
    });
  };

  const MarketPrices = (
    <View style={styles.flex}>
      <SMHeader title="Market Prices" onBack={() => setScreen(selectedWarehouse ? Screen.WarehouseDetail : Screen.Warehouses)} />
      <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
        <View style={styles.invHeaderBlock}>
          <Text style={styles.invSectionTitle}>Today's Paddy Market Rates</Text>
          <Text style={styles.invSectionDesc}>
            Current market prices for all paddy varieties with daily price changes and trend indicators.
          </Text>
        </View>

        {getMarketPricesForWarehouse(selectedWarehouse).map(mp => {
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
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Intro section above the calendar */}
        <View style={[styles.padH, { marginTop: 8, marginBottom: 4 }]}>
          <Text style={styles.invSectionTitle}>Available Time Slots</Text>
          <Text style={styles.invSectionDesc}>
            Choose your preferred time slot to store harvest and get paid.
          </Text>
        </View>
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
      {/* Selected Summary */}
      {selectedDates.length>0 && (
        <View style={[styles.summaryCard, styles.padH]}>
          <Text style={[styles.valueText, { fontWeight: '700', marginBottom: 4 }]}>Selected Warehouse - {selectedWarehouse?.name ?? 'N/A'}</Text>
          <Text style={[styles.valueText, { fontWeight: '700' }]}>Selected Dates - {formatSelectedDates()}</Text>
        </View>
      )}

      {/* Time Slots (show when a single date is selected) */}
  {selectedDates.length === 1 && (
        <View style={[styles.slotCard, styles.padH]}>
          <Text style={styles.slotSmallLabel}>Your Selected Date</Text>
          <View style={[styles.valueBox, { marginTop: 6, marginBottom: 12 }]}>
            <Text style={styles.valueText}>{formatSingleSelectedDate()}</Text>
          </View>

          <Text style={styles.slotSectionTitle}>Available Slots -  Morning</Text>
          <View style={{ marginTop: 8 }}>
            {morningSlots.length === 0 && (
              <Text style={[styles.cardMeta, { paddingVertical: 8 }]}>No slots available for the selected date.</Text>
            )}
            {morningSlots.map(slot => (
              <View key={slot.id} style={styles.slotItemRow}>
                <Text style={styles.slotTimeText}>{slot.label}</Text>
                {slot.available ? (
                  <CustomButton
                    title="Book Slot"
                    size="small"
                    variant="primary"
                    onPress={() => { setSelectedTimeSlot(slot.label); setShowDetailsForm(true); }}
                  />
                ) : (
                  <View style={styles.slotDisabledPill}>
                    <Text style={styles.slotDisabledText}>Not Available</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
  )}
  {selectedDates.length !== 1 && (
        <View style={styles.padH}>
          <CustomButton title="Book Slot" onPress={() => setShowDetailsForm(true)} variant="primary" size="large" fullWidth={true} disabled={selectedDates.length===0} />
        </View>
  )}

  </ScrollView>

      {/* Details Form Overlay */}
      {showDetailsForm && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={() => { setShowDetailsForm(false); Keyboard.dismiss(); }} accessibilityRole="button" />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={24}>
            <View style={styles.bottomSheet}>
              <ScrollView contentContainerStyle={styles.sheetScrollBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.sheetTitle}>Provide Your Details</Text>

            {selectedDates.length === 1 && selectedTimeSlot && (
              <View style={[styles.summaryCard, { marginBottom: 12 }]}>
                <Text style={[styles.valueText, { fontWeight: '700', marginBottom: 4 }]}>Selected Date - {formatSingleSelectedDate()}</Text>
                <Text style={[styles.valueText, { fontWeight: '700' }]}>Selected Slot - {selectedTimeSlot}</Text>
              </View>
            )}

            <View style={styles.formFieldBlock}>
              <Text style={styles.sheetLabel}>Name</Text>
              <TextInput
                placeholder="Enter Your Name"
                style={inputStyle}
                value={formData.name}
                onChangeText={(t)=>setFormData({ ...formData, name: t })}
              />
            </View>
            <View style={styles.formFieldBlock}>
              <Text style={styles.sheetLabel}>Location</Text>
              <TextInput
                placeholder="Enter Accurate Location of Your Land"
                style={inputStyle}
                value={formData.location}
                onChangeText={(t)=>setFormData({ ...formData, location: t })}
              />
            </View>
            <View style={styles.formFieldBlock}>
              <Text style={styles.sheetLabel}>Contact Number</Text>
              <TextInput
                placeholder="Enter Your Phone Number"
                style={inputStyle}
                keyboardType="phone-pad"
                value={formData.contactNumber}
                onChangeText={(t)=>setFormData({ ...formData, contactNumber: t })}
              />
            </View>

            <View>
              <CustomButton
                title={isLoading ? 'Processing...' : 'Book Slot'}
                onPress={() => {
                  if (!formData.name.trim() || !formData.location.trim() || !formData.contactNumber.trim()) return;
                  setIsLoading(true);
                  setTimeout(()=>{ setIsLoading(false); setShowDetailsForm(false); setShowConfirmation(true); }, 1200);
                }}
                variant="primary"
                size="large"
                fullWidth={true}
                loading={isLoading}
                disabled={isLoading}
              />
              <View style={{ height: 8 }} />
              <CustomButton
                title="Cancel"
                onPress={() => { setShowDetailsForm(false); setFormData({ name:'', location:'', contactNumber:'' }); setSelectedTimeSlot(null); }}
                variant="outline"
                size="large"
                fullWidth={true}
              />
            </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Confirmation Overlay */}
      {showConfirmation && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmHeader}>
            <View style={{ width: 48, height: 48 }} />
            <Text style={styles.confirmHeaderTitle}>Success!</Text>
            <View style={{ width: 48, height: 48 }} />
          </View>

          <View style={styles.confirmCenter}>
            <View style={styles.checkRing}>
              <MaterialIcons name="check" size={48} color="#000" />
            </View>
            <Text style={styles.confirmBig}>Storage Slot Request Submitted!</Text>
            <Text style={styles.confirmDesc}>
              Your warehouse deposit slot is reserved! Please arrive on time with your crops, valid ID, and booking confirmation. Our team will weigh, inspect, and store your products safely.
            </Text>
            <CustomButton
              title="Finish"
              onPress={() => { setShowConfirmation(false); setScreen(Screen.Warehouses); setSelectedTimeSlot(null); }}
              variant="primary"
              size="large"
              fullWidth={true}
            />
          </View>
        </View>
      )}
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
    case Screen.BookingForm: content = null; break; // legacy route unused
    case Screen.BookingConfirmation: content = null; break; // legacy route unused
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
  scrollBody: { paddingBottom: 32 },

  // Slot card + rows
  slotCard: { backgroundColor: Colors.background.default, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8 },
  slotSmallLabel: { fontSize: 12, color: Colors.text.secondary },
  slotSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  slotItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
  slotTimeText: { fontSize: 13, color: Colors.text.primary },
  slotDisabledPill: { backgroundColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  slotDisabledText: { color: '#9CA3AF', fontWeight: '700', fontSize: 12 },

  // Market styles

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

  // Overlays (match Machine Rent look & behavior)
  overlayContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 50 },
  overlayBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 40, },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, paddingBottom: 32, zIndex: 60, elevation: 10 },
  sheetScrollBody: { paddingBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 16 },
  sheetLabel: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  formFieldBlock: { marginBottom: 8 },
  summaryCard: { backgroundColor: Colors.background.default, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8 },

  confirmOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' },
  confirmHeader: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confirmHeaderTitle: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center' },
  confirmCenter: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  checkRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#000', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  confirmBig: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 12 },
  confirmDesc: { fontSize: 14, color: '#000', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 8 },
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
