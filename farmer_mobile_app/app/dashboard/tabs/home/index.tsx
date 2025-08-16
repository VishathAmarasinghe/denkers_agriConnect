import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ImageBackground, Pressable, ScrollView, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '@/slice/authSlice/Auth';

export default function HomeScreen() {
  const router = useRouter();
  const userProfile = useSelector(selectUserProfile);
  const { height: screenHeight } = Dimensions.get('window');
  const contentBottomPadding = 140; // ensure visible above custom tab bar (100px + extra space)

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    if (userProfile) {
      return userProfile.first_name || userProfile.username || 'Farmer';
    }
    return 'Farmer';
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ImageBackground
        source={require('@/assets/images/dashboard.png')}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-black/10">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: contentBottomPadding }}
            showsVerticalScrollIndicator={false}
          >
            {/* Location pill and settings button */}
            <View className="mt-4 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center rounded-3xl bg-gray-800/60 px-4 py-3" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <MaterialIcons name="location-on" size={18} color="#FFFFFF" />
                <Text className="ml-2 text-sm font-semibold text-white">Galenbidunuwewa</Text>
              </View>
              <View className="ml-3">
                {/* Settings Button */}
                <Pressable
                  onPress={() => router.push('/dashboard/settings')}
                  className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden"
                >
                  <View className="h-full w-full bg-gray-400 items-center justify-center">
                    <MaterialIcons name="settings" size={24} color="#666" />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Greetings + weather */}
            <View className="mt-32">
              <Text className="text-2xl font-bold text-white">
                Hi, {getUserGreeting()} {getUserName()}!
              </Text>
              <View className="mt-4 flex-row items-start justify-between">
                <Text className="text-6xl leading-none font-bold text-white">27°C</Text>
                <View className="items-end pt-1">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color="#FFFFFF" />
                    <Text className="ml-2 text-lg font-semibold text-white">Partly Cloudy</Text>
                  </View>
                  <Text className="mt-1 text-sm font-medium text-white">11.30 AM | 9 Aug</Text>
                </View>
              </View>

              {/* Weather badges */}
              <View className="mt-4 flex-row">
                <View className="mr-3 flex-row items-center rounded-2xl bg-gray-700/60 px-3 py-2" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <MaterialCommunityIcons name="weather-windy" size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-xs font-medium text-white">2.4km/h</Text>
                </View>
                <View className="flex-row items-center rounded-2xl bg-gray-700/60 px-3 py-2" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <MaterialCommunityIcons name="water-percent" size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-xs font-medium text-white">72.5%</Text>
                </View>
              </View>
            </View>

            {/* Action tiles grid */}
            <View className="mt-16">
              <View className="flex-row">
                <View className="mr-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/soilManagement')}
                    className="items-center justify-center rounded-2xl"
                    style={{ 
                      height: 110, 
                      backgroundColor: 'rgba(255,255,255,0.85)', 
                      borderWidth: 1, 
                      borderColor: 'rgba(255,255,255,0.2)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <MaterialCommunityIcons name="flask-outline" size={32} color="#333" style={{ marginBottom: 8 }} />
                    <Text className="text-sm font-semibold text-gray-800">Soil Testing</Text>
                  </Pressable>
                </View>
                <View className="ml-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/fieldVisit')}
                    className="items-center justify-center rounded-2xl"
                    style={{ 
                      height: 110, 
                      backgroundColor: 'rgba(255,255,255,0.85)', 
                      borderWidth: 1, 
                      borderColor: 'rgba(255,255,255,0.2)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <MaterialCommunityIcons name="account-tie" size={32} color="#333" style={{ marginBottom: 8 }} />
                    <Text className="text-sm font-semibold text-gray-800">Field Visit</Text>
                  </Pressable>
                </View>
              </View>

              <View className="mt-3 flex-row">
                <View className="mr-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/machineRent')}
                    className="items-center justify-center rounded-2xl"
                    style={{ 
                      height: 110, 
                      backgroundColor: 'rgba(255,255,255,0.85)', 
                      borderWidth: 1, 
                      borderColor: 'rgba(255,255,255,0.2)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <MaterialCommunityIcons name="tractor" size={32} color="#333" style={{ marginBottom: 8 }} />
                    <Text className="text-sm font-semibold text-gray-800">Machine Rent</Text>
                  </Pressable>
                </View>
                <View className="ml-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/harvestHub')}
                    className="items-center justify-center rounded-2xl"
                    style={{ 
                      height: 110, 
                      backgroundColor: 'rgba(255,255,255,0.85)', 
                      borderWidth: 1, 
                      borderColor: 'rgba(255,255,255,0.2)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <MaterialCommunityIcons name="basket" size={32} color="#333" style={{ marginBottom: 8 }} />
                    <Text className="text-sm font-semibold text-gray-800">Harvest Hub</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="mt-8">
              <Text className="mb-4 text-lg font-semibold text-white">Quick Stats</Text>
              <View className="flex-row">
                <View className="mr-3 flex-1 rounded-2xl bg-gray-800/60 p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Text className="text-2xl font-bold text-white">3</Text>
                  <Text className="text-sm text-gray-300">Active Fields</Text>
                </View>
                <View className="ml-3 flex-1 rounded-2xl bg-gray-800/60 p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Text className="text-2xl font-bold text-white">12</Text>
                  <Text className="text-sm text-gray-300">Soil Tests</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
