import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CHAT_AGENTS, ChatAgent, ChatMessage } from '../../../types/chatAgent';
import { geminiService } from '../../../utils/geminiService';

export default function ChatScreen() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const [agent, setAgent] = useState<ChatAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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

  useEffect(() => {
    const selectedAgent = CHAT_AGENTS.find(a => a.id === agentId);
    if (selectedAgent) {
      setAgent(selectedAgent);
      // Add initial greeting message
      const greetingMessage: ChatMessage = {
        id: '1',
        text: `ආයුබෝවන්! මම ${selectedAgent.name}. ඔබේ ගොවිතැන් අවශ්‍යතාවන් සමඟ අද ඔබට සහාය විය හැක්කේ කෙසේද?`,
        isUser: false,
        timestamp: new Date(),
        agentId: selectedAgent.id
      };
      setMessages([greetingMessage]);
    } else {
      router.back();
    }
  }, [agentId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !agent || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Add typing indicator
      const typingMessage: ChatMessage = {
        id: 'typing',
        text: 'සිතමින්...',
        isUser: false,
        timestamp: new Date(),
        agentId: agent.id,
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      // Generate AI response
      const response = await geminiService.generateResponse(
        agent,
        inputText,
        messages.filter(m => !m.isTyping)
      );

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== 'typing');
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
          agentId: agent.id
        };
        return [...withoutTyping, aiResponse];
      });

    } catch (error) {
      console.error('Error generating response:', error);
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'සමාවන්න, මට දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.',
        isUser: false,
        timestamp: new Date(),
        agentId: agent?.id
      };
      setMessages(prev => [...prev, errorMessage]);
      
      Alert.alert(
        'දෝෂය',
        'ප්‍රතිචාරය ලබා ගැනීමට අසමත් විය. කරුණාකර ඔබේ අන්තර්ජාල සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (questionText: string) => {
    setInputText(questionText);
  };

  if (!agent) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-gray-600">පූරණය වෙමින්...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white shadow-sm">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <MaterialIcons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          
          {/* Agent Avatar */}
          <View className="relative mr-3">
            <Image
              source={getAgentImage(agent.id)}
              className="h-16 w-16 rounded-full"
              resizeMode="cover"
            />
            <View 
              className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full border-2 border-white"
              style={{ backgroundColor: agent.color }}
            >
              <Text className="text-sm">{agent.avatar}</Text>
            </View>
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {agent.name}
            </Text>
            <View className="flex-row items-center">
              <View className="mr-2 h-2 w-2 rounded-full bg-green-500" />
              <Text className="text-sm text-gray-500">සක්‍රීය</Text>
            </View>
          </View>

          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <MaterialIcons name="more-vert" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {messages.map(message => (
          <View 
            key={message.id} 
            className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
          >
            <View className={`max-w-[85%] ${message.isUser ? 'items-end' : 'items-start'}`}>
              <View 
                className={`rounded-2xl px-4 py-3 ${
                  message.isUser 
                    ? 'bg-blue-600' 
                    : message.isTyping 
                      ? 'bg-gray-200' 
                      : 'bg-white shadow-sm'
                }`}
              >
                {message.isTyping ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-600">{message.text}</Text>
                  </View>
                ) : (
                  <Text className={`text-sm leading-6 ${
                    message.isUser ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.text}
                  </Text>
                )}
              </View>
              <Text className={`mt-1 text-xs ${
                message.isUser ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Questions */}
      {agent.quickQuestions.length > 0 && (
        <View className="border-t border-gray-200 bg-white px-4 py-4">
          <Text className="mb-3 text-sm font-semibold text-gray-700">
            ඉක්මන් ප්‍රශ්න:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {agent.quickQuestions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  className="rounded-full bg-gray-100 px-4 py-2"
                  onPress={() => handleQuickQuestion(question.text)}
                  disabled={isLoading}
                >
                  <Text className="text-sm text-gray-700">
                    {question.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <View className="border-t border-gray-200 bg-white px-4 py-4">
        <View className="flex-row items-end space-x-3">
          <View className="flex-1">
            <TextInput
              className="max-h-24 min-h-12 rounded-full bg-gray-100 px-4 py-3 text-gray-800"
              placeholder="ගොවිතැන් ගැන ඕනෑම දෙයක් අසන්න..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!isLoading}
            />
          </View>
          <TouchableOpacity
            className={`h-12 w-12 items-center justify-center rounded-full ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600'
            }`}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}