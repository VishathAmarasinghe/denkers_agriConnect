import { APPLICATION_FARMER } from '@/config/config';
import { useAppSelector } from '@/slice/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function Layout() {
  const authSlice = useAppSelector(state => state?.auth);
  const roles = authSlice?.roles || [];

  return (
    <View className="flex-1 bg-transparent">
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarStyle: {
            width: '100%',
            backgroundColor: 'transparent',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: 10,
            overflow: 'visible',
            height: 96,
            justifyContent: 'center',
            alignSelf: 'center',
            flexDirection: 'column',
            marginBottom: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            borderTopWidth: 0,
          },
          tabBarBackground: () => <TabBarBackground />,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
            color: '#FFFFFF',
          },
        })}
      >
        {/* HOME TAB */}
        {roles.includes(APPLICATION_FARMER) && (
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'home' : 'home-outline'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              ),
            }}
          />
        )}

        {/* SOIL TEST TAB */}
        {roles.includes(APPLICATION_FARMER) && (
          <Tabs.Screen
            name="soilManagement"
            options={{
              title: 'Soil Test',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'flask' : 'flask-outline'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              ),
            }}
          />
        )}

        {/* OFFICERS TAB */}
        {roles.includes(APPLICATION_FARMER) && (
          <Tabs.Screen
            name="fieldVisit"
            options={{
              title: 'Officers',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'account-group' : 'account-group-outline'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              ),
            }}
          />
        )}

        {/* MACHINES TAB */}
        {roles.includes(APPLICATION_FARMER) && (
          <Tabs.Screen
            name="machineRent"
            options={{
              title: 'Machines',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'tractor-variant' : 'tractor-variant'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              ),
            }}
          />
        )}

        {/* HARVEST TAB */}
        {roles.includes(APPLICATION_FARMER) && (
          <Tabs.Screen
            name="harvestHub"
            options={{
              title: 'Harvest',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'barn' : 'barn'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              ),
            }}
          />
        )}

        {/* Chat is not part of tabs; accessible via floating button only */}
        
      </Tabs>
    </View>
  );
}
