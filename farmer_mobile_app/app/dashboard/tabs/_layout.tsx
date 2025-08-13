import { APPLICATION_FARMER } from '@/config/config';
import { useAppSelector } from '@/slice/store';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

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
          tabBarInactiveTintColor: '#D8F1E5',
          tabBarStyle: {
            width: '100%',
            backgroundColor: 'transparent',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: 6,
            overflow: 'visible',
            height: 88,
            justifyContent: 'center',
            alignSelf: 'center',
            flexDirection: 'column',
            marginBottom: 0,
            shadowColor: 'transparent',
            borderTopWidth: 0,
          },
          tabBarBackground: () => (
            <View
              style={{
                position: 'absolute',
                left: '-5%',
                width: '110%',
                height: '100%',
                backgroundColor: '#52B788',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              }}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginTop: 4,
          },
        })}
      >
        {/* No explicit index route under tabs */}
        {/* HOME TAB */}
        {roles.includes(APPLICATION_FARMER) && (
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#FFFFFF' : '#D8F1E5'} />
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
                <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={24} color={focused ? '#FFFFFF' : '#D8F1E5'} />
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
                <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={focused ? '#FFFFFF' : '#D8F1E5'} />
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
                <Ionicons name={focused ? 'construct' : 'construct-outline'} size={24} color={focused ? '#FFFFFF' : '#D8F1E5'} />
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
                <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#FFFFFF' : '#D8F1E5'} />
              ),
            }}
          />
        )}

        {/* Chat is not part of tabs; accessible via floating button only */}
        
      </Tabs>
    </View>
  );
}
