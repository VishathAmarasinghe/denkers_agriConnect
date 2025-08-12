import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="landingScreen" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="loginSignupSelectorScreen" options={{ headerShown: false }} />
      <Stack.Screen name="onboardingScreen" options={{ headerShown: false }} />
      <Stack.Screen name="languageScreen" options={{ headerShown: false }} />
      <Stack.Screen name="locationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="newPassword" options={{ headerShown: false }} />
      <Stack.Screen name="passwordChanged" options={{ headerShown: false }} />
      <Stack.Screen name="loginSelector" options={{ headerShown: false }} />
      <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
      <Stack.Screen name="otpCode" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
