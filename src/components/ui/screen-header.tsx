import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { GradientHeader } from "@/components/ui/gradient-header";

type ScreenHeaderProps = {
  title: string;
  subtitle: string;
  /** Telas principais abrem o menu lateral; as demais mostram o botão voltar. */
  leading: { type: "back" | "menu"; onPress: () => void };
  /** Rendered on the right side, e.g. a date badge. */
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, leading, right }: ScreenHeaderProps) {
  const isMenu = leading.type === "menu";

  return (
    <GradientHeader className="flex-row items-center gap-three">
      <Pressable
        onPress={leading.onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={isMenu ? "Abrir menu" : "Voltar"}
        className="h-10 w-10 items-center justify-center rounded-two bg-white/[0.18] active:opacity-70"
      >
        <Ionicons name={isMenu ? "menu" : "chevron-back"} size={20} color="#ffffff" />
      </Pressable>

      <View className="flex-1">
        <ThemedText className="text-xl font-bold text-white">{title}</ThemedText>
        <ThemedText type="small" className="text-xs leading-4 text-white/85">
          {subtitle}
        </ThemedText>
      </View>

      {right}
    </GradientHeader>
  );
}
