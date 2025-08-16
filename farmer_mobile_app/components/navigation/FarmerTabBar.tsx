import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }>
  = {
    home: { active: 'home', inactive: 'home-outline', label: 'Home' },
    soilManagement: { active: 'flask', inactive: 'flask-outline', label: 'Soil Test' },
    fieldVisit: { active: 'people', inactive: 'people-outline', label: 'Officers' },
    machineRent: { active: 'car', inactive: 'car-outline', label: 'Machines' },
    // Use widely-supported icons to avoid squares on some platforms
    harvestHub: { active: 'cube', inactive: 'cube-outline', label: 'Harvest' },
  };

function resolveKey(routeName: string): keyof typeof ICONS | undefined {
  const n = routeName.toLowerCase();
  if (n.includes('home')) return 'home';
  if (n.includes('soil')) return 'soilManagement';
  if (n.includes('field')) return 'fieldVisit';
  if (n.includes('machine')) return 'machineRent';
  if (n.includes('harvest')) return 'harvestHub';
  // Common expo-router pattern like "fieldVisit/index" -> take the first segment (fieldVisit)
  const firstSeg = routeName.split('/')?.[0];
  switch (firstSeg) {
    case 'home':
    case 'soilManagement':
    case 'fieldVisit':
    case 'machineRent':
    case 'harvestHub':
      return firstSeg as any;
  }
  return undefined;
}

export default function FarmerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Hide the tab bar if the focused route requests it via tabBarStyle: { display: 'none' }
  const focusedRoute = state.routes[state.index];
  const focusedOptions: any = descriptors[focusedRoute.key]?.options;
  if (focusedOptions?.tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <View
        style={{
          height: 92,
          backgroundColor: Colors.primary.main,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 20,
          paddingBottom: 14,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {(() => {
          const usedKeys = new Set<string>();
          return state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const key = resolveKey(route.name);
            if (key && usedKeys.has(key)) {
              return null; // ensure only one entry per top-level key (e.g., soilManagement)
            }
            if (key) usedKeys.add(key);
          const fallbackLabel = descriptors[route.key]?.options?.title
            ?? (resolveKey(route.name)?.toString() ?? route.name)
            ?? route.name;
          const cfg = key ? ICONS[key] : { active: 'square', inactive: 'square-outline', label: fallbackLabel } as any;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{ alignItems: 'center', justifyContent: 'center', width: 64 }}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isFocused ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}>
                {key === 'machineRent' ? (
                  <MaterialCommunityIcons
                    name={'tractor-variant' as any}
                    size={22}
                    color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                  />
                ) : (
                  <Ionicons
                    name={(isFocused ? cfg.active : cfg.inactive) as any}
                    size={22}
                    color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                  />
                )}
              </View>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                marginTop: 6,
                color: isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                letterSpacing: 0.5,
              }}>
                {cfg.label}
              </Text>
            </Pressable>
          );
        });})()}
      </View>
    </View>
  );
}
