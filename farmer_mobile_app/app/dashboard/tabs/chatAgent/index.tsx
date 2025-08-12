import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatAgentScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI farming assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I understand your question. Let me provide you with some helpful information about farming practices.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1">
        {/* Header */}
        <View className="items-center bg-blue-800 p-4">
          <MaterialIcons name="smart-toy" size={32} color="white" />
          <Text className="mt-2 text-xl font-bold text-white">AI Farming Assistant</Text>
          <Text className="mt-1 text-sm text-blue-200">Powered by AgriConnect AI</Text>
        </View>

        {/* Chat Messages */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {messages.map(message => (
            <View key={message.id} className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}>
              <Card className={`max-w-80 ${message.isUser ? 'bg-blue-600' : 'bg-white'}`}>
                <Card.Content className="p-3">
                  <Text className={`text-sm ${message.isUser ? 'text-white' : 'text-gray-800'}`}>{message.text}</Text>
                  <Text className={`mt-2 text-xs ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <Card className="mx-4 mb-4 shadow-md">
          <Card.Content>
            <Title className="mb-3 text-base text-blue-800">Quick Questions</Title>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                className="rounded-full bg-blue-100 px-3 py-2"
                onPress={() => setInputText('How to improve soil fertility?')}
              >
                <Text className="text-xs text-blue-800">Soil Fertility</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-full bg-blue-100 px-3 py-2"
                onPress={() => setInputText('Best time to plant corn?')}
              >
                <Text className="text-xs text-blue-800">Planting Time</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-full bg-blue-100 px-3 py-2"
                onPress={() => setInputText('How to control pests naturally?')}
              >
                <Text className="text-xs text-blue-800">Pest Control</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-full bg-blue-100 px-3 py-2"
                onPress={() => setInputText('Irrigation schedule tips?')}
              >
                <Text className="text-xs text-blue-800">Irrigation</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Input Area */}
        <View className="border-t border-gray-200 bg-white p-4">
          <View className="flex-row items-center space-x-2">
            <TextInput
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-gray-800"
              placeholder="Ask me anything about farming..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full bg-blue-600"
              onPress={sendMessage}
            >
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
