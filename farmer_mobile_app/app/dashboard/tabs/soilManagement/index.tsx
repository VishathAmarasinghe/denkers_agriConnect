import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SoilTest {
  id: string;
  field: string;
  date: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  status: 'optimal' | 'good' | 'needs-improvement' | 'poor';
}

export default function SoilManagementScreen() {
  const [soilTests] = useState<SoilTest[]>([
    {
      id: '1',
      field: 'North Field',
      date: 'Oct 15, 2024',
      ph: 6.8,
      nitrogen: 45,
      phosphorus: 32,
      potassium: 28,
      organicMatter: 3.2,
      status: 'optimal',
    },
    {
      id: '2',
      field: 'South Field',
      date: 'Oct 10, 2024',
      ph: 5.9,
      nitrogen: 38,
      phosphorus: 25,
      potassium: 22,
      organicMatter: 2.8,
      status: 'good',
    },
    {
      id: '3',
      field: 'East Field',
      date: 'Oct 5, 2024',
      ph: 5.2,
      nitrogen: 28,
      phosphorus: 18,
      potassium: 15,
      organicMatter: 2.1,
      status: 'needs-improvement',
    },
    {
      id: '4',
      field: 'West Field',
      date: 'Sep 30, 2024',
      ph: 4.8,
      nitrogen: 22,
      phosphorus: 12,
      potassium: 10,
      organicMatter: 1.5,
      status: 'poor',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'check-circle';
      case 'good':
        return 'thumb-up';
      case 'needs-improvement':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'help';
    }
  };

  const getNutrientColor = (value: number, optimal: number, range: number) => {
    if (value >= optimal - range && value <= optimal + range) return '#4CAF50';
    if (value >= optimal - range * 1.5 && value <= optimal + range * 1.5) return '#FF9800';
    return '#F44336';
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="bg-green-600 p-4 rounded-lg mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Soil Management</Text>
              <Text className="text-green-200 mt-1">Monitor and improve soil health</Text>
            </View>
            <MaterialIcons name="eco" size={40} color="white" />
          </View>
        </View>

        {/* Soil Health Overview */}
        <View className="flex-row justify-between mb-6">
          <Card className="flex-1 mx-1 bg-green-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text className="text-lg font-bold text-green-800">1</Text>
              <Text className="text-xs text-green-600">Optimal</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-blue-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="thumb-up" size={24} color="#2196F3" />
              <Text className="text-lg font-bold text-blue-800">1</Text>
              <Text className="text-xs text-blue-600">Good</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-yellow-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="warning" size={24} color="#FF9800" />
              <Text className="text-lg font-bold text-yellow-800">1</Text>
              <Text className="text-xs text-yellow-600">Needs Work</Text>
            </Card.Content>
          </Card>

          <Card className="flex-1 mx-1 bg-red-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="error" size={24} color="#F44336" />
              <Text className="text-lg font-bold text-red-800">1</Text>
              <Text className="text-xs text-red-600">Poor</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Latest Soil Test Results */}
        <Card className="mb-6 shadow-md">
          <Card.Content>
            <Title className="text-lg text-green-800 mb-4">Latest Soil Test Results</Title>
            
            {soilTests.slice(0, 2).map((test) => (
              <View key={test.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-semibold text-gray-800">{test.field}</Text>
                  <Chip className={getStatusColor(test.status)}>
                    {test.status.replace('-', ' ').charAt(0).toUpperCase() + test.status.replace('-', ' ').slice(1)}
                  </Chip>
                </View>
                
                <Text className="text-sm text-gray-600 mb-3">Tested on {test.date}</Text>
                
                <View className="space-y-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-700">pH Level</Text>
                    <View className="flex-row items-center">
                      <View className={`w-3 h-3 rounded-full mr-2 ${test.ph >= 6.0 && test.ph <= 7.0 ? 'bg-green-500' : test.ph >= 5.5 && test.ph <= 7.5 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <Text className="text-sm font-medium">{test.ph}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-700">Nitrogen (N)</Text>
                    <View className="flex-row items-center">
                      <View className={`w-3 h-3 rounded-full mr-2 ${getNutrientColor(test.nitrogen, 40, 10) === '#4CAF50' ? 'bg-green-500' : getNutrientColor(test.nitrogen, 40, 10) === '#FF9800' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <Text className="text-sm font-medium">{test.nitrogen} ppm</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-700">Organic Matter</Text>
                    <View className="flex-row items-center">
                      <View className={`w-3 h-3 rounded-full mr-2 ${test.organicMatter >= 3.0 ? 'bg-green-500' : test.organicMatter >= 2.0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <Text className="text-sm font-medium">{test.organicMatter}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* All Soil Tests */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Title className="text-lg text-green-800">All Soil Tests</Title>
            <Button 
              mode="contained" 
              icon={() => <MaterialIcons name="add" size={20} color="white" />}
              onPress={() => {}}
            >
              Schedule Test
            </Button>
          </View>

          {soilTests.map((test) => (
            <Card key={test.id} className="mb-3 shadow-md">
              <Card.Content className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Title className="text-lg text-gray-800 mb-1">{test.field}</Title>
                    <Text className="text-sm text-gray-600">Tested on {test.date}</Text>
                  </View>
                  <Chip 
                    className={getStatusColor(test.status)}
                    icon={() => (
                      <MaterialIcons 
                        name={getStatusIcon(test.status)} 
                        size={16} 
                        color={test.status === 'optimal' ? '#4CAF50' : test.status === 'good' ? '#2196F3' : test.status === 'needs-improvement' ? '#FF9800' : '#F44336'} 
                      />
                    )}
                  >
                    {test.status.replace('-', ' ').charAt(0).toUpperCase() + test.status.replace('-', ' ').slice(1)}
                  </Chip>
                </View>

                {/* Nutrient Levels */}
                <View className="bg-gray-50 p-3 rounded-lg mb-3">
                  <Text className="text-sm font-medium text-gray-800 mb-2">Nutrient Levels</Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">pH: {test.ph}</Text>
                      <Text className="text-xs text-gray-600">N: {test.nitrogen} ppm</Text>
                      <Text className="text-xs text-gray-600">P: {test.phosphorus} ppm</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">K: {test.potassium} ppm</Text>
                      <Text className="text-xs text-gray-600">OM: {test.organicMatter}%</Text>
                      <Text className="text-xs text-gray-600"></Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row space-x-2">
                  <Button 
                    mode="outlined" 
                    size="small"
                    icon={() => <MaterialIcons name="visibility" size={16} color="#055476" />}
                    onPress={() => {}}
                  >
                    View Report
                  </Button>
                  <Button 
                    mode="contained" 
                    size="small"
                    icon={() => <MaterialIcons name="edit" size={16} color="white" />}
                    onPress={() => {}}
                  >
                    Recommendations
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Soil Health Tips */}
        <Card className="mb-6 shadow-md">
          <Card.Content>
            <Title className="text-lg text-green-800 mb-4">Soil Health Tips</Title>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <MaterialIcons name="water-drop" size={20} color="#2196F3" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Proper Irrigation</Text>
                  <Text className="text-xs text-gray-600">Maintain consistent soil moisture without overwatering</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="eco" size={20} color="#4CAF50" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Crop Rotation</Text>
                  <Text className="text-xs text-gray-600">Rotate crops to prevent nutrient depletion and pest buildup</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="grass" size={20} color="#8BC34A" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Cover Crops</Text>
                  <Text className="text-xs text-gray-600">Plant cover crops to improve soil structure and fertility</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="recycling" size={20} color="#FF9800" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Organic Matter</Text>
                  <Text className="text-xs text-gray-600">Add compost and organic materials to improve soil health</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
