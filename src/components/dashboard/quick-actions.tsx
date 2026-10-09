import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { BrandColor, Gradients } from "@/constants/theme";

export type QuickAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Cor do ícone e classe do fundo. Sem `color`, usa o gradiente da marca (ação principal). */
  color?: { icon: string; backgroundClass: string };
  onPress: () => void;
};

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <SectionCard title="Ações Rápidas" icon="flash-outline">
      <View className="flex-row justify-between">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            className="flex-1 items-center gap-two active:opacity-70"
          >
            {action.color ? (
              <View className={`h-14 w-14 items-center justify-center rounded-three ${action.color.backgroundClass}`}>
                <Ionicons name={action.icon} size={24} color={action.color.icon} />
              </View>
            ) : (
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-14 w-14 items-center justify-center rounded-three"
              >
                <Ionicons name={action.icon} size={24} color="#ffffff" />
              </LinearGradient>
            )}
            <ThemedText type="smallBold" className="text-center text-xs leading-4" numberOfLines={1}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </SectionCard>
  );
}

export const QUICK_ACTION_COLORS = {
  blue: { icon: BrandColor, backgroundClass: "bg-[#EAF2FE]" },
  purple: { icon: "#7C3AED", backgroundClass: "bg-[#F1ECFD]" },
  cyan: { icon: "#0E7490", backgroundClass: "bg-[#E2F6FB]" },
};
