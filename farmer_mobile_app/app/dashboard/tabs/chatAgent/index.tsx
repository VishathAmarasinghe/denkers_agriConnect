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
      text: 'Hello! I\'m your AI farming assistant. How can I help you today?',
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
        <View className="bg-blue-800 p-4 items-center">
          <MaterialIcons name="smart-toy" size={32} color="white" />
          <Text className="text-xl font-bold text-white mt-2">AI Farming Assistant</Text>
          <Text className="text-sm text-blue-200 mt-1">Powered by AgriConnect AI</Text>
        </View>

        {/* Chat Messages */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
            >
              <Card className={`max-w-80 ${message.isUser ? 'bg-blue-600' : 'bg-white'}`}>
                <Card.Content className="p-3">
                  <Text className={`text-sm ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
                    {message.text}
                  </Text>
                  <Text className={`text-xs mt-2 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <Card className="mx-4 mb-4 shadow-md">
          <Card.Content>
            <Title className="text-base text-blue-800 mb-3">Quick Questions</Title>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity 
                className="bg-blue-100 px-3 py-2 rounded-full"
                onPress={() => setInputText('How to improve soil fertility?')}
              >
                <Text className="text-blue-800 text-xs">Soil Fertility</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-100 px-3 py-2 rounded-full"
                onPress={() => setInputText('Best time to plant corn?')}
              >
                <Text className="text-blue-800 text-xs">Planting Time</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-100 px-3 py-2 rounded-full"
                onPress={() => setInputText('How to control pests naturally?')}
              >
                <Text className="text-blue-800 text-xs">Pest Control</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-100 px-3 py-2 rounded-full"
                onPress={() => setInputText('Irrigation schedule tips?')}
              >
                <Text className="text-blue-800 text-xs">Irrigation</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Input Area */}
        <View className="bg-white p-4 border-t border-gray-200">
          <View className="flex-row items-center space-x-2">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-800"
              placeholder="Ask me anything about farming..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center"
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
