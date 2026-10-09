import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { Gradients } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

type BalanceCardsProps = {
  totalReceivable: number;
  totalPayable: number;
  cashBalance: number;
};

export function BalanceCards({ totalReceivable, totalPayable, cashBalance }: BalanceCardsProps) {
  const [showCash, setShowCash] = useState(false);
  const totalBalance = totalReceivable - totalPayable;

  return (
    <View className="gap-three">
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="gap-three rounded-three p-three"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-one">
            <ThemedText type="small" className="text-white/90">
              Saldo Total
            </ThemedText>
            <ThemedText className="text-[28px] font-bold leading-9 text-white">
              {formatCurrency(totalBalance)}
            </ThemedText>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-two bg-white/20">
            <Ionicons name="logo-usd" size={20} color="#ffffff" />
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-two bg-white/[0.18] px-three py-three">
          <View className="flex-row items-center gap-two">
            <Ionicons name="card-outline" size={18} color="#ffffff" />
            <ThemedText type="small" className="text-white">
              Caixa
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setShowCash((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showCash ? "Ocultar saldo do caixa" : "Mostrar saldo do caixa"}
            className="flex-row items-center gap-two active:opacity-70"
          >
            <ThemedText type="smallBold" className="text-white">
              {showCash ? formatCurrency(cashBalance) : "R$ •••••"}
            </ThemedText>
            <Ionicons name={showCash ? "eye-off-outline" : "eye-outline"} size={18} color="#ffffff" />
          </Pressable>
        </View>
      </LinearGradient>

      <View className="flex-row gap-three">
        <MiniCard
          label="A Pagar"
          value={totalPayable}
          colorClass="text-danger"
          icon="card-outline"
          iconColor="#60646C"
        />
        <MiniCard
          label="A Receber"
          value={totalReceivable}
          colorClass="text-success"
          icon="trending-up"
          iconColor="#2F855A"
        />
      </View>
    </View>
  );
}

type MiniCardProps = {
  label: string;
  value: number;
  /** Classe de cor do texto, ex: `text-danger`. */
  colorClass: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
};

function MiniCard({ label, value, colorClass, icon, iconColor }: MiniCardProps) {
  return (
    <View className="flex-1 gap-one rounded-three bg-paper p-three">
      <View className="flex-row items-center justify-between">
        <ThemedText type="small" className={colorClass}>
          {label}
        </ThemedText>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <ThemedText className={`text-lg font-bold ${colorClass}`} numberOfLines={1} adjustsFontSizeToFit>
        {formatCurrency(value)}
      </ThemedText>
    </View>
  );
}
