import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, ProgressBar, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Harvest {
  id: string;
  crop: string;
  field: string;
  progress: number;
  status: 'planning' | 'in-progress' | 'completed';
  startDate: string;
  estimatedCompletion: string;
  yield: string;
}

export default function HarvestHubScreen() {
  const [harvests] = useState<Harvest[]>([
    {
      id: '1',
      crop: 'Corn',
      field: 'North Field',
      progress: 75,
      status: 'in-progress',
      startDate: 'Oct 15, 2024',
      estimatedCompletion: 'Oct 25, 2024',
      yield: '180 tons',
    },
    {
      id: '2',
      crop: 'Soybeans',
      field: 'South Field',
      progress: 100,
      status: 'completed',
      startDate: 'Sep 20, 2024',
      estimatedCompletion: 'Oct 5, 2024',
      yield: '95 tons',
    },
    {
      id: '3',
      crop: 'Wheat',
      field: 'East Field',
      progress: 0,
      status: 'planning',
      startDate: 'Nov 10, 2024',
      estimatedCompletion: 'Nov 25, 2024',
      yield: '120 tons',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return 'schedule';
      case 'in-progress':
        return 'trending-up';
      case 'completed':
        return 'check-circle';
      default:
        return 'help';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="bg-green-700 p-4 rounded-lg mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Harvest Hub</Text>
              <Text className="text-green-200 mt-1">Manage your harvest operations</Text>
            </View>
            <MaterialIcons name="agriculture" size={40} color="white" />
          </View>
        </View>

        {/* Harvest Overview */}
        <View className="flex-row justify-between mb-6">
          <Card className="flex-1 mx-1 bg-green-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
              <Text className="text-lg font-bold text-green-800">1</Text>
              <Text className="text-xs text-green-600">In Progress</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-blue-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="schedule" size={24} color="#2196F3" />
              <Text className="text-lg font-bold text-blue-800">1</Text>
              <Text className="text-xs text-blue-600">Planned</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-gray-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="check-circle" size={24} color="#666" />
              <Text className="text-lg font-bold text-gray-800">1</Text>
              <Text className="text-xs text-gray-600">Completed</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Current Harvest Progress */}
        <Card className="mb-6 shadow-md">
          <Card.Content>
            <Title className="text-lg text-green-800 mb-4">Current Harvest Progress</Title>
            
            {harvests.filter(h => h.status === 'in-progress').map((harvest) => (
              <View key={harvest.id} className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800">{harvest.crop}</Text>
                  <Chip className={getStatusColor(harvest.status)}>
                    {harvest.progress}% Complete
                  </Chip>
                </View>
                
                <Text className="text-sm text-gray-600 mb-3">{harvest.field}</Text>
                
                <ProgressBar 
                  progress={harvest.progress / 100} 
                  color="#4CAF50" 
                  className="mb-3"
                />
                
                <View className="flex-row justify-between text-sm">
                  <Text className="text-gray-600">Started: {harvest.startDate}</Text>
                  <Text className="text-gray-600">Est. Completion: {harvest.estimatedCompletion}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* All Harvests */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Title className="text-lg text-green-800">All Harvests</Title>
            <Button 
              mode="contained" 
              icon={() => <MaterialIcons name="add" size={20} color="white" />}
              onPress={() => {}}
            >
              Plan Harvest
            </Button>
          </View>

          {harvests.map((harvest) => (
            <Card key={harvest.id} className="mb-3 shadow-md">
              <Card.Content className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Title className="text-lg text-gray-800 mb-1">{harvest.crop}</Title>
                    <Text className="text-sm text-gray-600">{harvest.field}</Text>
                  </View>
                  <Chip 
                    className={getStatusColor(harvest.status)}
                    icon={() => (
                      <MaterialIcons 
                        name={getStatusIcon(harvest.status)} 
                        size={16} 
                        color={harvest.status === 'planning' ? '#2196F3' : harvest.status === 'in-progress' ? '#FF9800' : '#4CAF50'} 
                      />
                    )}
                  >
                    {harvest.status.replace('-', ' ').charAt(0).toUpperCase() + harvest.status.replace('-', ' ').slice(1)}
                  </Chip>
                </View>

                {harvest.status === 'in-progress' && (
                  <View className="mb-3">
                    <ProgressBar 
                      progress={harvest.progress / 100} 
                      color="#4CAF50" 
                      className="mb-2"
                    />
                    <Text className="text-xs text-gray-500 text-right">{harvest.progress}% Complete</Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <MaterialIcons name="event" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">{harvest.startDate}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="scale" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">Est. Yield: {harvest.yield}</Text>
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
                  {harvest.status === 'planning' && (
                    <Button 
                      mode="contained" 
                      size="small"
                      icon={() => <MaterialIcons name="play-arrow" size={16} color="white" />}
                      onPress={() => {}}
                    >
                      Start Harvest
                    </Button>
                  )}
                  {harvest.status === 'in-progress' && (
                    <Button 
                      mode="contained" 
                      size="small"
                      icon={() => <MaterialIcons name="update" size={16} color="white" />}
                      onPress={() => {}}
                    >
                      Update Progress
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Harvest Tips */}
        <Card className="mb-6 shadow-md">
          <Card.Content>
            <Title className="text-lg text-green-800 mb-4">Harvest Tips</Title>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <MaterialIcons name="lightbulb" size={20} color="#FF9800" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Optimal Harvest Time</Text>
                  <Text className="text-xs text-gray-600">Harvest when moisture content is 14-15% for best storage quality</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="schedule" size={20} color="#2196F3" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Weather Monitoring</Text>
                  <Text className="text-xs text-gray-600">Check weather forecasts and avoid harvesting during wet conditions</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="storage" size={20} color="#4CAF50" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Storage Preparation</Text>
                  <Text className="text-xs text-gray-600">Ensure storage facilities are clean and properly ventilated</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
