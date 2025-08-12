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
      <View className="flex-1 items-center justify-center p-5">
        <View className="mb-8 items-center">
          <MaterialIcons name="check-circle" size={80} color="#52B788" />
        </View>

        <Text className="mb-3 text-center text-3xl font-bold text-green-700">Password Changed!</Text>
        <Text className="mb-8 text-center text-base text-gray-600">Your password has been successfully updated</Text>

        <View className="mb-8 max-w-sm rounded-lg bg-green-50 p-5">
          <Text className="text-center text-sm leading-5 text-green-800">
            You can now use your new password to sign in to your account. Please keep your password secure and don't
            share it with anyone.
          </Text>
        </View>

        <Button mode="contained" className="mb-5" onPress={handleContinue} style={{ backgroundColor: '#52B788' }}>
          Continue to Sign In
        </Button>

        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    </SafeAreaView>
  );
}
