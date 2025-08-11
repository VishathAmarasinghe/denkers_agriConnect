import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { MD3LightTheme as DefaultPaperTheme, PaperProvider, Portal } from "react-native-paper";
import "react-native-reanimated";
import { Provider } from "react-redux";
import "../global.css";

import Snackbar from "@/components/ui/Snackbar";
import { store } from "@/slice/store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Roboto-Black": require("../assets/fonts/Roboto-Black.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Italic": require("../assets/fonts/Roboto-Italic.ttf"),
    "Roboto-Light": require("../assets/fonts/Roboto-Light.ttf"),
    "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Thin": require("../assets/fonts/Roboto-Thin.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Custom Paper Theme with Green Colors based on #52B788
  const customPaperTheme = {
    ...DefaultPaperTheme,
    colors: {
      ...DefaultPaperTheme.colors,
      primary: "#52B788", // Your primary green color
      onPrimary: "#ffffff", // Text on primary background
      primaryContainer: "#E8F5E8", // Light green container
      secondaryContainer: "#F0F9F0", // Very light green
      surface: "#FAFFFA", // Light green tinted background
      background: "#FFFFFF", // Pure white background
      outline: "#52B788", // Border color using primary
      text: "#1A1A1A", // Dark text for good contrast
      onSurface: "#1A1A1A", // Text color on surface
      surfaceVariant: "#F5F9F5", // Light green surface variant
      onSurfaceVariant: "#2D4A3D", // Dark green text on surface variant
      error: "#DC3545", // Error color (red)
      onError: "#FFFFFF", // Text on error background
      errorContainer: "#F8D7DA", // Light error container
      onErrorContainer: "#721C24", // Text on error container
      success: "#28A745", // Success color (green)
      onSuccess: "#FFFFFF", // Text on success background
      warning: "#FFC107", // Warning color (yellow)
      onWarning: "#212529", // Text on warning background
    },
    roundness: 12, // Slightly more rounded corners for modern look
  };

  return (
    <Provider store={store}>
      
      {/* Force DefaultTheme for navigation */}
      <ThemeProvider value={DefaultTheme}>
        {/* Force PaperProvider to use customPaperTheme (light mode) */}
        <PaperProvider theme={customPaperTheme}>
          <Portal.Host>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="dashboard" options={{ headerShown: false }} />
              {/* <Stack.Screen name="tabs" options={{ headerShown: false }} />
              <Stack.Screen name="client-tabs" options={{ headerShown: false }} /> */}
              <Stack.Screen name="+not-found" />
            </Stack>
            <Snackbar />
          </Portal.Host>
          {/* Force status bar to light mode */}
          <StatusBar style="dark" />
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}
