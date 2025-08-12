import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6 items-center py-5">
          <MaterialIcons name="agriculture" size={32} color="#055476" />
          <Text className="mt-2 text-3xl font-bold text-blue-800">AgriConnect</Text>
          <Text className="mt-1 text-base text-gray-600">Smart Farming Dashboard</Text>
        </View>

        {/* Quick Stats */}
        <View className="mb-5 flex-row justify-between">
          <Card className="mx-1 flex-1 shadow-md">
            <Card.Content>
              <View className="flex-row items-center">
                <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
                <View className="ml-3">
                  <Title className="mb-0 text-xl text-blue-800">85%</Title>
                  <Paragraph className="mb-0 text-xs text-gray-600">Crop Health</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card className="mx-1 flex-1 shadow-md">
            <Card.Content>
              <View className="flex-row items-center">
                <MaterialIcons name="water-drop" size={24} color="#2196F3" />
                <View className="ml-3">
                  <Title className="mb-0 text-xl text-blue-800">72%</Title>
                  <Paragraph className="mb-0 text-xs text-gray-600">Soil Moisture</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Activities */}
        <Card className="mb-5 shadow-md">
          <Card.Content>
            <Title className="mb-4 text-lg text-blue-800">Recent Activities</Title>

            <View className="flex-row items-center border-b border-blue-100 py-3">
              <MaterialIcons name="schedule" size={20} color="#055476" />
              <Text className="ml-3 flex-1 text-sm text-gray-800">Field inspection completed - North Field</Text>
              <Text className="ml-2 text-xs text-gray-500">2 hours ago</Text>
            </View>

            <View className="flex-row items-center border-b border-blue-100 py-3">
              <MaterialIcons name="notifications" size={20} color="#FF9800" />
              <Text className="ml-3 flex-1 text-sm text-gray-800">Irrigation system maintenance due</Text>
              <Text className="ml-2 text-xs text-gray-500">5 hours ago</Text>
            </View>

            <View className="flex-row items-center py-3">
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text className="ml-3 flex-1 text-sm text-gray-800">Harvest planning scheduled</Text>
              <Text className="ml-2 text-xs text-gray-500">1 day ago</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-5 shadow-md">
          <Card.Content>
            <Title className="mb-4 text-lg text-blue-800">Quick Actions</Title>

            <View className="space-y-3">
              <Button
                mode="contained"
                className="mb-2"
                icon={() => <MaterialIcons name="add" size={20} color="white" />}
                onPress={() => {}}
              >
                New Field Visit
              </Button>

              <Button
                mode="outlined"
                className="mb-2"
                icon={() => <MaterialIcons name="chat" size={20} color="#055476" />}
                onPress={() => {}}
              >
                Chat with AI
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Weather Info */}
        <Card className="mb-5 shadow-md">
          <Card.Content>
            <View className="flex-row items-center">
              <MaterialIcons name="wb-sunny" size={32} color="#FF9800" />
              <View className="ml-4">
                <Title className="mb-0 text-2xl text-blue-800">24°C</Title>
                <Paragraph className="mb-1 text-base text-gray-600">Partly Cloudy</Paragraph>
                <Text className="text-xs text-gray-500">North Field, Farm Zone</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
