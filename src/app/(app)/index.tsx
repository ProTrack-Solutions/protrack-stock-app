import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { useAuth } from "@/contexts/auth-context";
import { BrandColor, Gradients, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);

  const firstName = user?.name?.split(" ")[0];

  const confirmSignOut = () => {
    Alert.alert("Sair da conta?", "Você precisará entrar novamente.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          await signOut();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="light" />
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="gap-one rounded-b-four px-four pb-four"
        style={{ paddingTop: insets.top + Spacing.four }}
      >
        <View className="flex-row items-center justify-between">
          <ThemedText type="small" className="text-white/85">
            {firstName ? `Olá, ${firstName}` : "Olá"}
          </ThemedText>
          <Pressable
            onPress={confirmSignOut}
            disabled={signingOut}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Sair"
            className="flex-row items-center gap-one rounded-full bg-white/[0.18] px-three py-one active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={16} color="#ffffff" />
            <ThemedText type="smallBold" className="text-white">
              {signingOut ? "Saindo..." : "Sair"}
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText className="text-[26px] font-semibold leading-8 text-white">
          ProTrack Gerencial
        </ThemedText>
        {user?.department_name ? (
          <ThemedText type="small" className="text-white/85">
            {user.department_name}
          </ThemedText>
        ) : null}
      </LinearGradient>

      <ScrollView contentContainerClassName="w-full max-w-content self-center gap-three p-four">
        <ThemedText type="smallBold" themeColor="textSecondary">
          Ações rápidas
        </ThemedText>
        <Pressable
          onPress={() => router.push("/nova-venda")}
          accessibilityRole="button"
          className="flex-row items-center gap-three rounded-three bg-paper p-three active:opacity-80"
        >
          <View className="h-11 w-11 items-center justify-center rounded-two bg-[#EEF5FF]">
            <Ionicons name="cart-outline" size={22} color={BrandColor} />
          </View>
          <View className="flex-1">
            <ThemedText className="font-bold">Nova Venda</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Cadastre uma venda em poucos toques
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#60646C" />
        </Pressable>
      </ScrollView>
    </View>
  );
}
