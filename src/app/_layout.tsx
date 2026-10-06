import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </KeyboardProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {/* A splash nativa fica visível até a sessão salva ser verificada. */}
      {status !== "loading" && <AnimatedSplashOverlay />}
    </>
  );
}
