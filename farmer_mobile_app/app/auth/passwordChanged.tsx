import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordChangedScreen() {
  const handleContinue = () => {
    // TODO: Navigate to appropriate screen after password change
    router.push('/auth/signIn');
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 justify-center items-center p-5">
        <View className="items-center mb-8">
          <MaterialIcons name="check-circle" size={80} color="#52B788" />
        </View>
        
        <Text className="text-3xl font-bold text-green-700 text-center mb-3">Password Changed!</Text>
        <Text className="text-base text-gray-600 text-center mb-8">Your password has been successfully updated</Text>
        
        <View className="bg-green-50 p-5 rounded-lg mb-8 max-w-sm">
          <Text className="text-sm text-green-800 text-center leading-5">
            You can now use your new password to sign in to your account. 
            Please keep your password secure and don't share it with anyone.
          </Text>
        </View>
        
        <Button 
          mode="contained" 
          className="mb-5"
          onPress={handleContinue}
          style={{ backgroundColor: '#52B788' }}
        >
          Continue to Sign In
        </Button>
        
        <Button 
          mode="text" 
          onPress={() => router.back()}
        >
          Back
        </Button>
      </View>
    </SafeAreaView>
  );
}
