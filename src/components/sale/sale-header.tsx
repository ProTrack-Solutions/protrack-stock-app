import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { formatShortDate } from "@/utils/format";

type SaleHeaderProps = {
  date: Date;
  onBack: () => void;
};

export function SaleHeader({ date, onBack }: SaleHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center gap-three bg-paper px-four pb-three"
      style={{
        paddingTop: insets.top + Spacing.three,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#E0E1E6",
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="h-10 w-10 items-center justify-center rounded-two bg-paper active:bg-surface"
        style={{ borderWidth: 1, borderColor: "#E0E1E6" }}
      >
        <Ionicons name="chevron-back" size={20} color="#000000" />
      </Pressable>

      <View className="flex-1">
        <ThemedText className="text-xl font-bold">Nova Venda</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" className="text-xs leading-4">
          Cadastre uma venda em poucos toques.
        </ThemedText>
      </View>

      <View className="flex-row items-center gap-one rounded-full bg-[#E8F7EE] px-two py-one">
        <View className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
        <ThemedText type="smallBold" className="text-xs" style={{ color: "#15803D" }}>
          {formatShortDate(date)}
        </ThemedText>
      </View>
    </View>
  );
}
