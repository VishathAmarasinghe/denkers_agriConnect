import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: 'analytics',
      title: 'Smart Analytics',
      description: 'Get insights into your farm performance with AI-powered analytics and recommendations.',
      color: '#52B788'
    },
    {
      icon: 'monitor',
      title: 'Real-time Monitoring',
      description: 'Monitor your crops, soil, and equipment in real-time from anywhere in the world.',
      color: '#52B788'
    },
    {
      icon: 'support-agent',
      title: 'AI Farming Assistant',
      description: 'Get expert advice and answers to your farming questions 24/7.',
      color: '#52B788'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // TODO: Navigate to main app
      router.push('/dashboard/tabs/home');
    }
  };

  const handleSkip = () => {
    // TODO: Navigate to main app
    router.push('/dashboard/tabs/home');
  };

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 p-5">
        {/* Progress Bar */}
        <View className="flex-row justify-center mb-8 mt-10">
          {steps.map((_, index) => (
            <View
              key={index}
              className={`w-3 h-3 rounded-full mx-1 ${
                index <= currentStep ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Step Content */}
        <View className="flex-1 justify-center items-center">
          <View className="items-center mb-8">
            <MaterialIcons 
              name={currentStepData.icon as any} 
              size={100} 
              color={currentStepData.color} 
            />
          </View>
          
          <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
            {currentStepData.title}
          </Text>
          
          <Text className="text-base text-gray-600 text-center mb-8 leading-6 px-4">
            {currentStepData.description}
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center">
          <Button 
            mode="text" 
            onPress={handleSkip}
          >
            Skip
          </Button>
          
          <Button 
            mode="contained" 
            onPress={handleNext}
            icon={() => (
              <MaterialIcons 
                name={currentStep === steps.length - 1 ? 'check' : 'arrow-forward'} 
                size={24} 
                color="white" 
              />
            )}
            style={{ backgroundColor: '#52B788' }}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
