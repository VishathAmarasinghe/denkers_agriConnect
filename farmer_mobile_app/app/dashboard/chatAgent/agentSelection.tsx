import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CHAT_AGENTS, ChatAgent } from '../../../types/chatAgent';

const { width } = Dimensions.get('window');

export default function AgentSelectionScreen() {
  const handleAgentSelect = (agent: ChatAgent) => {
    router.push({
      pathname: '/dashboard/chatAgent/chat',
      params: { agentId: agent.id }
    });
  };

  // Profile images for each agent
  const getAgentImage = (agentId: string) => {
    const images: Record<string, any> = {
      farming_advisor: require('../../../assets/images/agents/1.png'),
      crop_technician: require('../../../assets/images/agents/2.png'),
      fertilizer_specialist: require('../../../assets/images/agents/3.png'),
      market_advisor: require('../../../assets/images/agents/4.png'),
      financial_advisor: require('../../../assets/images/agents/5.png'),
    };
    return images[agentId] || images.farming_advisor;
  };

  const getAgentBanner = (agentId: string) => {
    const banners: Record<string, any> = {
      farming_advisor: require('../../../assets/images/office1.jpg'),
      crop_technician: require('../../../assets/images/office2.jpg'),
      fertilizer_specialist: require('../../../assets/images/office3.jpg'),
      market_advisor: require('../../../assets/images/office4.jpg'),
      financial_advisor: require('../../../assets/images/office1.jpg'),
    };
    return banners[agentId] || banners.farming_advisor;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <MaterialIcons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              AI විශේෂඥයන්
            </Text>
            <Text className="mt-1 text-gray-600">
              ඔබේ අවශ්‍යතාවට සුදුසු විශේෂඥයෙකු තෝරන්න
            </Text>
          </View>
        </View>
      </View>

      {/* Agents Grid */}
      <ScrollView 
        className="flex-1 px-4 pt-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {CHAT_AGENTS.map((agent) => (
          <TouchableOpacity
            key={agent.id}
            onPress={() => handleAgentSelect(agent)}
            className="mb-4"
            activeOpacity={0.7}
          >
            <View className="overflow-hidden rounded-xl bg-white shadow-sm">
              {/* Agent Image */}
              <View className="relative">
                <Image
                  source={getAgentBanner(agent.id)}
                  className="h-48 w-full"
                  resizeMode="cover"
                />
                {/* Overlay */}
                <View className="absolute inset-0 bg-black/20" />
                
                {/* Avatar Badge */}
                <View className="absolute bottom-4 left-4">
                  <View 
                    className="h-28 w-28 items-center justify-center rounded-full border-4 border-white overflow-hidden"
                  >
                    <Image
                      source={getAgentImage(agent.id)}
                      className="h-full w-full rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* Status Badge */}
                <View className="absolute right-4 top-4">
                  <View className="flex-row items-center rounded-full bg-green-500 px-3 py-1">
                    <View className="mr-2 h-2 w-2 rounded-full bg-white" />
                    <Text className="text-xs font-medium text-white">සක්‍රීය</Text>
                  </View>
                </View>
              </View>

              {/* Agent Info */}
              <View className="p-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">
                    {agent.name}
                  </Text>
                  <MaterialIcons name="chat" size={24} color={agent.color} />
                </View>

                <Text className="mb-4 text-gray-600 leading-6">
                  {agent.description}
                </Text>

                {/* Expertise Tags */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">
                    විශේෂතා:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {agent.expertise?.slice(0, 3).map((skill, index) => (
                      <View
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1"
                      >
                        <Text className="text-xs text-gray-700">{skill}</Text>
                      </View>
                    )) || []}
                    {agent.expertise && agent.expertise.length > 3 && (
                      <View className="rounded-full bg-gray-100 px-3 py-1">
                        <Text className="text-xs text-gray-700">
                          +{agent.expertise.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Sample Questions */}
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">
                    නිදර්ශන ප්‍රශ්න:
                  </Text>
                  <View className="space-y-2">
                    {agent.quickQuestions.slice(0, 2).map((question) => (
                      <View key={question.id} className="flex-row items-start">
                        <MaterialIcons name="help-outline" size={16} color="#9CA3AF" className="mr-2 mt-1" />
                        <Text className="flex-1 text-sm text-gray-600">
                          {question.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Call to Action Button */}
                <TouchableOpacity
                  onPress={() => handleAgentSelect(agent)}
                  className="flex-row items-center justify-center rounded-lg py-3"
                  style={{ backgroundColor: agent.color }}
                >
                  <MaterialIcons name="chat-bubble" size={20} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    සංවාදය ආරම්භ කරන්න
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      
    </SafeAreaView>
  );
}