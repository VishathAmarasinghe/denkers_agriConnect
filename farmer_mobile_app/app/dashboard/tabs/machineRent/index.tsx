import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Searchbar, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Machine {
  id: string;
  name: string;
  type: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  status: 'available' | 'rented' | 'maintenance';
  image: string;
  description: string;
  location: string;
}

export default function MachineRentScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [machines] = useState<Machine[]>([
    {
      id: '1',
      name: 'John Deere 6120M',
      type: 'Tractor',
      dailyRate: 150,
      weeklyRate: 800,
      monthlyRate: 2800,
      status: 'available',
      image: 'tractor',
      description: 'Modern 120HP tractor with GPS guidance system',
      location: 'North Equipment Yard',
    },
    {
      id: '2',
      name: 'Case IH 1660',
      type: 'Combine Harvester',
      dailyRate: 300,
      weeklyRate: 1600,
      monthlyRate: 5500,
      status: 'rented',
      image: 'combine',
      description: 'High-capacity combine for large-scale harvesting',
      location: 'South Equipment Yard',
    },
    {
      id: '3',
      name: 'Kubota BX2380',
      type: 'Compact Tractor',
      dailyRate: 80,
      weeklyRate: 400,
      monthlyRate: 1400,
      status: 'available',
      image: 'compact-tractor',
      description: 'Versatile compact tractor for small farms',
      location: 'East Equipment Yard',
    },
    {
      id: '4',
      name: 'New Holland T4.75',
      type: 'Tractor',
      dailyRate: 120,
      weeklyRate: 650,
      monthlyRate: 2200,
      status: 'maintenance',
      image: 'tractor',
      description: 'Reliable 75HP tractor with front loader',
      location: 'West Equipment Yard',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'check-circle';
      case 'rented':
        return 'schedule';
      case 'maintenance':
        return 'build';
      default:
        return 'help';
    }
  };

  const getMachineIcon = (type: string) => {
    switch (type) {
      case 'Tractor':
        return 'agriculture';
      case 'Combine Harvester':
        return 'crop';
      case 'Compact Tractor':
        return 'agriculture';
      default:
        return 'build';
    }
  };

  const filteredMachines = machines.filter(
    machine =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6 rounded-lg bg-orange-600 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Machine Rent</Text>
              <Text className="mt-1 text-orange-200">Rent farming equipment</Text>
            </View>
            <MaterialIcons name="build" size={40} color="white" />
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search machines..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          className="mb-6 bg-white shadow-md"
          iconColor="#055476"
        />

        {/* Quick Stats */}
        <View className="mb-6 flex-row justify-between">
          <Card className="mx-1 flex-1 bg-green-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text className="text-lg font-bold text-green-800">2</Text>
              <Text className="text-xs text-green-600">Available</Text>
            </Card.Content>
          </Card>

          <Card className="mx-1 flex-1 bg-blue-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="schedule" size={24} color="#2196F3" />
              <Text className="text-lg font-bold text-blue-800">1</Text>
              <Text className="text-xs text-blue-600">Rented</Text>
            </Card.Content>
          </Card>

          <Card className="mx-1 flex-1 bg-red-50">
            <Card.Content className="items-center py-3">
              <MaterialIcons name="build" size={24} color="#F44336" />
              <Text className="text-lg font-bold text-red-800">1</Text>
              <Text className="text-xs text-red-600">Maintenance</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Available Machines */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Title className="text-lg text-orange-800">Available Equipment</Title>
            <Button
              mode="outlined"
              icon={() => <MaterialIcons name="filter-list" size={20} color="#055476" />}
              onPress={() => {}}
            >
              Filter
            </Button>
          </View>

          {filteredMachines.map(machine => (
            <Card key={machine.id} className="mb-3 shadow-md">
              <Card.Content className="p-4">
                <View className="mb-3 flex-row items-start">
                  <View className="mr-4 rounded-lg bg-orange-100 p-3">
                    <MaterialIcons name={getMachineIcon(machine.type)} size={32} color="#FF9800" />
                  </View>

                  <View className="flex-1">
                    <Title className="mb-1 text-lg text-gray-800">{machine.name}</Title>
                    <Text className="mb-2 text-sm text-gray-600">{machine.type}</Text>
                    <Text className="mb-2 text-xs text-gray-500">{machine.description}</Text>

                    <View className="mb-2 flex-row items-center">
                      <MaterialIcons name="location-on" size={16} color="#666" />
                      <Text className="ml-1 text-xs text-gray-600">{machine.location}</Text>
                    </View>
                  </View>

                  <Chip
                    className={getStatusColor(machine.status)}
                    icon={() => (
                      <MaterialIcons
                        name={getStatusIcon(machine.status)}
                        size={16}
                        color={
                          machine.status === 'available'
                            ? '#4CAF50'
                            : machine.status === 'rented'
                              ? '#2196F3'
                              : '#F44336'
                        }
                      />
                    )}
                  >
                    {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                  </Chip>
                </View>

                {/* Pricing */}
                <View className="mb-3 rounded-lg bg-gray-50 p-3">
                  <Text className="mb-2 text-sm font-medium text-gray-800">Rental Rates</Text>
                  <View className="flex-row justify-between">
                    <View className="items-center">
                      <Text className="text-lg font-bold text-orange-600">${machine.dailyRate}</Text>
                      <Text className="text-xs text-gray-600">Daily</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-orange-600">${machine.weeklyRate}</Text>
                      <Text className="text-xs text-gray-600">Weekly</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-orange-600">${machine.monthlyRate}</Text>
                      <Text className="text-xs text-gray-600">Monthly</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                  <Button
                    mode="outlined"
                    size="small"
                    icon={() => <MaterialIcons name="visibility" size={16} color="#055476" />}
                    onPress={() => {}}
                  >
                    View Details
                  </Button>

                  {machine.status === 'available' && (
                    <Button
                      mode="contained"
                      size="small"
                      icon={() => <MaterialIcons name="add-shopping-cart" size={16} color="white" />}
                      onPress={() => {}}
                    >
                      Rent Now
                    </Button>
                  )}

                  {machine.status === 'rented' && (
                    <Button
                      mode="outlined"
                      size="small"
                      icon={() => <MaterialIcons name="schedule" size={16} color="#055476" />}
                      onPress={() => {}}
                    >
                      Check Availability
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Rental Tips */}
        <Card className="mb-6 shadow-md">
          <Card.Content>
            <Title className="mb-4 text-lg text-orange-800">Rental Tips</Title>

            <View className="space-y-3">
              <View className="flex-row items-start">
                <MaterialIcons name="schedule" size={20} color="#FF9800" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Book Early</Text>
                  <Text className="text-xs text-gray-600">
                    Popular equipment gets booked quickly during peak seasons
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="checklist" size={20} color="#4CAF50" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Inspect Equipment</Text>
                  <Text className="text-xs text-gray-600">
                    Always inspect equipment before use and report any issues
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="payment" size={20} color="#2196F3" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">Insurance Coverage</Text>
                  <Text className="text-xs text-gray-600">Consider additional insurance for high-value equipment</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
