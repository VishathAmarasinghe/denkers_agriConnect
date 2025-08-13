import { MaterialIcons } from '@expo/vector-icons';
import { ImageBackground, Pressable, ScrollView, Text, View, Dimensions, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { height: screenHeight } = Dimensions.get('window');
  const contentBottomPadding = 120; // ensure visible above tab bar

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ImageBackground
        source={require('@/assets/images/landingPageImage.jpg')}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-black/20">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: contentBottomPadding }}
            showsVerticalScrollIndicator={false}
          >
            {/* Location pill and logo */}
            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center rounded-2xl bg-white/25 px-4 py-3">
                <MaterialIcons name="location-on" size={20} color="#FFFFFF" />
                <Text className="ml-2 text-base font-semibold text-white">Galenbidunuwewa</Text>
              </View>
              <Image source={require('@/assets/images/mainlogo.png')} className="ml-3 h-10 w-10 rounded-full" />
            </View>

            {/* Greetings + weather */}
            <View className="mt-6">
              <Text className="text-3xl font-extrabold text-white">Hi, Good Morning...</Text>
              <View className="mt-3 flex-row items-start justify-between">
                <Text className="text-[88px] leading-none font-extrabold text-white">27°C</Text>
                <View className="items-end pt-2">
                  <View className="flex-row items-center">
                    <MaterialIcons name="cloud" size={28} color="#FFFFFF" />
                    <Text className="ml-2 text-xl font-semibold text-white">Partly Cloudy</Text>
                  </View>
                  <Text className="mt-2 text-base font-semibold text-white">11:30 AM | 9 Aug</Text>
                </View>
              </View>

              {/* Badges */}
              <View className="mt-2 flex-row">
                <View className="mr-3 flex-row items-center rounded-xl bg-white/25 px-3 py-2">
                  <MaterialIcons name="air" size={18} color="#FFFFFF" />
                  <Text className="ml-2 text-sm font-semibold text-white">2.4km/h</Text>
                </View>
                <View className="flex-row items-center rounded-xl bg-white/25 px-3 py-2">
                  <MaterialIcons name="water-drop" size={18} color="#FFFFFF" />
                  <Text className="ml-2 text-sm font-semibold text-white">72.5%</Text>
                </View>
              </View>
            </View>

            {/* Actions grid - glass cards over image */}
            <View className="mt-6">
              <View className="flex-row">
                <View className="mr-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/soilManagement')}
                    className="items-center justify-center rounded-2xl bg-white/85"
                    style={{ height: 120 }}
                  >
                    <MaterialIcons name="science" size={44} color="#0E2230" />
                  </Pressable>
                  <Text className="mt-3 text-lg font-extrabold text-white">Soil Testing</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/fieldVisit')}
                    className="items-center justify-center rounded-2xl bg-white/85"
                    style={{ height: 120 }}
                  >
                    <MaterialIcons name="groups" size={44} color="#0E2230" />
                  </Pressable>
                  <Text className="mt-3 text-lg font-extrabold text-white">Officer Visit</Text>
                </View>
              </View>
              <View className="mt-4 flex-row">
                <View className="mr-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/machineRent')}
                    className="items-center justify-center rounded-2xl bg-white/85"
                    style={{ height: 120 }}
                  >
                    <MaterialIcons name="agriculture" size={44} color="#0E2230" />
                  </Pressable>
                  <Text className="mt-3 text-lg font-extrabold text-white">Rent Machine</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Pressable
                    onPress={() => router.push('/dashboard/tabs/harvestHub')}
                    className="items-center justify-center rounded-2xl bg-white/85"
                    style={{ height: 120 }}
                  >
                    <MaterialIcons name="home-work" size={44} color="#0E2230" />
                  </Pressable>
                  <Text className="mt-3 text-lg font-extrabold text-white">Harvest Hub</Text>
                </View>
              </View>
            </View>

            {/* Recent Activities - translucent cards */}
            <View className="mt-8">
              <Text className="mb-4 text-2xl font-extrabold text-white">Recent Activities</Text>
              <Card className="mb-3 bg-white/90">
                <Card.Content>
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={20} color="#055476" />
                    <Text className="ml-3 flex-1 text-sm text-gray-800">Field inspection completed - North Field</Text>
                    <Text className="ml-2 text-xs text-gray-500">2 hours ago</Text>
                  </View>
                </Card.Content>
              </Card>
              <Card className="mb-3 bg-white/90">
                <Card.Content>
                  <View className="flex-row items-center">
                    <MaterialIcons name="notifications" size={20} color="#FF9800" />
                    <Text className="ml-3 flex-1 text-sm text-gray-800">Irrigation system maintenance due</Text>
                    <Text className="ml-2 text-xs text-gray-500">5 hours ago</Text>
                  </View>
                </Card.Content>
              </Card>
              <Card className="bg-white/90">
                <Card.Content>
                  <View className="flex-row items-center">
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                    <Text className="ml-3 flex-1 text-sm text-gray-800">Harvest planning scheduled</Text>
                    <Text className="ml-2 text-xs text-gray-500">1 day ago</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>

          {/* Floating Chat Button */}
          <Pressable
            onPress={() => router.push('/dashboard/chatAgent')}
            className="absolute bottom-[90px] right-5 h-16 w-16 items-center justify-center rounded-full bg-[#52B788] shadow-lg"
          >
            <MaterialIcons name="smart-toy" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
