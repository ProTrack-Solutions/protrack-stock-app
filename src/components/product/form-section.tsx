import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";

type FormSectionProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  children: ReactNode;
};

export function FormSection({ title, subtitle, icon, gradient, children }: FormSectionProps) {
  return (
    <View className="gap-three rounded-three bg-paper p-three">
      <View
        className="flex-row items-center gap-three pb-three"
        style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#E0E1E6" }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-10 w-10 items-center justify-center rounded-two"
        >
          <Ionicons name={icon} size={20} color="#ffffff" />
        </LinearGradient>
        <View className="flex-1">
          <ThemedText className="font-bold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="text-xs leading-4">
            {subtitle}
          </ThemedText>
        </View>
      </View>
      {children}
    </View>
  );
}
