import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Field {
  id: string;
  name: string;
  area: string;
  crop: string;
  status: 'healthy' | 'warning' | 'critical';
  lastVisit: string;
  nextVisit: string;
}

export default function FieldVisitScreen() {
  const [fields] = useState<Field[]>([
    {
      id: '1',
      name: 'North Field',
      area: '25 acres',
      crop: 'Corn',
      status: 'healthy',
      lastVisit: '2 days ago',
      nextVisit: 'Tomorrow',
    },
    {
      id: '2',
      name: 'South Field',
      area: '18 acres',
      crop: 'Soybeans',
      status: 'warning',
      lastVisit: '5 days ago',
      nextVisit: 'Today',
    },
    {
      id: '3',
      name: 'East Field',
      area: '32 acres',
      crop: 'Wheat',
      status: 'healthy',
      lastVisit: '1 day ago',
      nextVisit: '3 days',
    },
    {
      id: '4',
      name: 'West Field',
      area: '15 acres',
      crop: 'Sunflowers',
      status: 'critical',
      lastVisit: '1 week ago',
      nextVisit: 'Overdue',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'check-circle';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'help';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6 rounded-lg bg-blue-800 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Field Management</Text>
              <Text className="mt-1 text-blue-200">Monitor and manage your fields</Text>
            </View>
            <MaterialIcons name="location-on" size={40} color="white" />
          </View>
        </View>

        {/* Quick Stats */}
        <View className="mb-6 flex-row justify-between">
          <Card className="mx-1 flex-1 bg-green-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text className="text-lg font-bold text-green-800">2</Text>
              <Text className="text-xs text-green-600">Healthy</Text>
            </Card.Content>
          </Card>

          <Card className="mx-1 flex-1 bg-yellow-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="warning" size={24} color="#FF9800" />
              <Text className="text-lg font-bold text-yellow-800">1</Text>
              <Text className="text-xs text-yellow-600">Warning</Text>
            </Card.Content>
          </Card>

          <Card className="mx-1 flex-1 bg-red-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="error" size={24} color="#F44336" />
              <Text className="text-lg font-bold text-red-800">1</Text>
              <Text className="text-xs text-red-600">Critical</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Fields List */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Title className="text-lg text-blue-800">Your Fields</Title>
            <Button
              mode="contained"
              icon={() => <MaterialIcons name="add" size={20} color="white" />}
              onPress={() => {}}
            >
              Add Field
            </Button>
          </View>

          {fields.map(field => (
            <Card key={field.id} className="mb-3 shadow-md">
              <Card.Content className="p-4">
                <View className="mb-3 flex-row items-start justify-between">
                  <View className="flex-1">
                    <Title className="mb-1 text-lg text-gray-800">{field.name}</Title>
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <MaterialIcons name="crop" size={16} color="#666" />
                        <Text className="ml-1 text-sm text-gray-600">{field.crop}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="straighten" size={16} color="#666" />
                        <Text className="ml-1 text-sm text-gray-600">{field.area}</Text>
                      </View>
                    </View>
                  </View>
                  <Chip
                    className={getStatusColor(field.status)}
                    icon={() => (
                      <MaterialIcons
                        name={getStatusIcon(field.status)}
                        size={16}
                        color={
                          field.status === 'healthy' ? '#4CAF50' : field.status === 'warning' ? '#FF9800' : '#F44336'
                        }
                      />
                    )}
                  >
                    {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                  </Chip>
                </View>

                <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color="#666" />
                    <Text className="ml-1 text-xs text-gray-600">Last: {field.lastVisit}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="event" size={16} color="#666" />
                    <Text className="ml-1 text-xs text-gray-600">Next: {field.nextVisit}</Text>
                  </View>
                </View>

                <View className="mt-3 flex-row space-x-2">
                  <Button
                    mode="outlined"
                    size="small"
                    icon={() => <MaterialIcons name="visibility" size={16} color="#055476" />}
                    onPress={() => {}}
                  >
                    View Details
                  </Button>
                  <Button
                    mode="contained"
                    size="small"
                    icon={() => <MaterialIcons name="add" size={16} color="white" />}
                    onPress={() => {}}
                  >
                    Schedule Visit
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Recent Visits */}
        <Card className="mb-6 shadow-md">
          <Card.Content>
            <Title className="mb-4 text-lg text-blue-800">Recent Field Visits</Title>

            <View className="space-y-3">
              <View className="flex-row items-center border-b border-gray-100 py-2">
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">North Field Inspection</Text>
                  <Text className="text-xs text-gray-500">Completed 2 days ago</Text>
                </View>
                <Chip className="bg-green-100 text-xs text-green-800">Completed</Chip>
              </View>

              <View className="flex-row items-center border-b border-gray-100 py-2">
                <MaterialIcons name="schedule" size={20} color="#FF9800" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">South Field Assessment</Text>
                  <Text className="text-xs text-gray-500">Scheduled for today</Text>
                </View>
                <Chip className="bg-blue-100 text-xs text-blue-800">Scheduled</Chip>
              </View>

              <View className="flex-row items-center py-2">
                <MaterialIcons name="warning" size={20} color="#FF9800" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">West Field Emergency</Text>
                  <Text className="text-xs text-gray-500">Overdue - Immediate attention needed</Text>
                </View>
                <Chip className="bg-red-100 text-xs text-red-800">Urgent</Chip>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
