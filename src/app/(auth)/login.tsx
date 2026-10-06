import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginForm } from "@/components/login/login-form";
import { LoginHero } from "@/components/login/login-hero";
import { ThemedView } from "@/components/themed-view";

export default function LoginScreen() {
  return (
    <ThemedView className="flex-1">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 items-center" edges={["left", "right", "bottom"]}>
        <KeyboardAwareScrollView
          style={{ width: "100%" }}
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-content self-center gap-five pb-four">
            <LoginHero />
            <View className="px-four">
              <LoginForm />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
