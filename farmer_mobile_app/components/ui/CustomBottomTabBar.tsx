import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

interface TabItem {
  name: string;
  route: string;
  icon: {
    active: string;
    inactive: string;
  };
  label: string;
}

const tabs: TabItem[] = [
  {
    name: 'home',
    route: '/dashboard/tabs/home',
    icon: {
      active: 'home',
      inactive: 'home-outline'
    },
    label: 'Home'
  },
  {
    name: 'soilManagement',
    route: '/dashboard/tabs/soilManagement',
    icon: {
      active: 'flask',
      inactive: 'flask-outline'
    },
    label: 'Soil Test'
  },
  {
    name: 'fieldVisit',
    route: '/dashboard/tabs/fieldVisit',
    icon: {
      active: 'account-group',
      inactive: 'account-group-outline'
    },
    label: 'Officers'
  },
  {
    name: 'machineRent',
    route: '/dashboard/tabs/machineRent',
    icon: {
      active: 'tractor-variant',
      inactive: 'tractor-variant'
    },
    label: 'Machines'
  },
  {
    name: 'harvestHub',
    route: '/dashboard/tabs/harvestHub',
    icon: {
      active: 'barn',
      inactive: 'barn'
    },
    label: 'Harvest'
  }
];

export default function CustomBottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      backgroundColor: '#52B788',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        const iconName = isActive ? tab.icon.active : tab.icon.inactive;
        
        return (
          <Pressable
            key={tab.name}
            onPress={() => handleTabPress(tab.route)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            <MaterialCommunityIcons
              name={iconName as any}
              size={22}
              color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
            />
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              marginTop: 6,
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
              letterSpacing: 0.5,
            }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
