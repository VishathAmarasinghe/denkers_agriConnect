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
        <View className="bg-blue-800 p-4 rounded-lg mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Field Management</Text>
              <Text className="text-blue-200 mt-1">Monitor and manage your fields</Text>
            </View>
            <MaterialIcons name="location-on" size={40} color="white" />
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mb-6">
          <Card className="flex-1 mx-1 bg-green-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text className="text-lg font-bold text-green-800">2</Text>
              <Text className="text-xs text-green-600">Healthy</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-yellow-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="warning" size={24} color="#FF9800" />
              <Text className="text-lg font-bold text-yellow-800">1</Text>
              <Text className="text-xs text-yellow-600">Warning</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-red-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="error" size={24} color="#F44336" />
              <Text className="text-lg font-bold text-red-800">1</Text>
              <Text className="text-xs text-red-600">Critical</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Fields List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Title className="text-lg text-blue-800">Your Fields</Title>
            <Button 
              mode="contained" 
              icon={() => <MaterialIcons name="add" size={20} color="white" />}
              onPress={() => {}}
            >
              Add Field
            </Button>
          </View>

          {fields.map((field) => (
            <Card key={field.id} className="mb-3 shadow-md">
              <Card.Content className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Title className="text-lg text-gray-800 mb-1">{field.name}</Title>
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <MaterialIcons name="crop" size={16} color="#666" />
                        <Text className="text-sm text-gray-600 ml-1">{field.crop}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="straighten" size={16} color="#666" />
                        <Text className="text-sm text-gray-600 ml-1">{field.area}</Text>
                      </View>
                    </View>
                  </View>
                  <Chip 
                    className={getStatusColor(field.status)}
                    icon={() => (
                      <MaterialIcons 
                        name={getStatusIcon(field.status)} 
                        size={16} 
                        color={field.status === 'healthy' ? '#4CAF50' : field.status === 'warning' ? '#FF9800' : '#F44336'} 
                      />
                    )}
                  >
                    {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                  </Chip>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">Last: {field.lastVisit}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="event" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">Next: {field.nextVisit}</Text>
                  </View>
                </View>

                <View className="flex-row space-x-2 mt-3">
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
            <Title className="text-lg text-blue-800 mb-4">Recent Field Visits</Title>
            
            <View className="space-y-3">
              <View className="flex-row items-center py-2 border-b border-gray-100">
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-800">North Field Inspection</Text>
                  <Text className="text-xs text-gray-500">Completed 2 days ago</Text>
                </View>
                <Chip className="bg-green-100 text-green-800 text-xs">Completed</Chip>
              </View>

              <View className="flex-row items-center py-2 border-b border-gray-100">
                <MaterialIcons name="schedule" size={20} color="#FF9800" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-800">South Field Assessment</Text>
                  <Text className="text-xs text-gray-500">Scheduled for today</Text>
                </View>
                <Chip className="bg-blue-100 text-blue-800 text-xs">Scheduled</Chip>
              </View>

              <View className="flex-row items-center py-2">
                <MaterialIcons name="warning" size={20} color="#FF9800" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-800">West Field Emergency</Text>
                  <Text className="text-xs text-gray-500">Overdue - Immediate attention needed</Text>
                </View>
                <Chip className="bg-red-100 text-red-800 text-xs">Urgent</Chip>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
