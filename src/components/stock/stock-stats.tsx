import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import type { StockStats as Stats } from "@/hooks/use-stock";
import { formatCurrency, formatNumber } from "@/utils/format";

type StockStatsProps = {
  stats: Stats;
  lowStockActive: boolean;
  onToggleLowStock: () => void;
};

export function StockStats({ stats, lowStockActive, onToggleLowStock }: StockStatsProps) {
  return (
    <View className="gap-three">
      <View className="flex-row gap-three">
        <StatCard label="PRODUTOS" value={formatNumber(stats.productsCount)} icon="cube-outline" gradient={["#3B82F6", "#2563EB"]} />
        <StatCard label="ITENS EM ESTOQUE" value={formatNumber(stats.itemsInStock)} icon="apps-outline" gradient={["#6366F1", "#9333EA"]} />
      </View>
      <View className="flex-row gap-three">
        <StatCard label="VALOR TOTAL" value={formatCurrency(stats.totalValue)} icon="logo-usd" gradient={["#10B981", "#0D9488"]} />
        <StatCard
          label="ESTOQUE BAIXO"
          value={formatNumber(stats.lowStockCount)}
          icon="warning-outline"
          gradient={["#F43F5E", "#F97316"]}
          action={
            stats.lowStockCount > 0 ? (
              <Pressable onPress={onToggleLowStock} hitSlop={8} accessibilityRole="button">
                <ThemedText type="smallBold" className="text-xs text-danger">
                  {lowStockActive ? "limpar" : "ver"}
                </ThemedText>
              </Pressable>
            ) : undefined
          }
        />
      </View>
    </View>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  action?: React.ReactNode;
};

function StatCard({ label, value, icon, gradient, action }: StatCardProps) {
  return (
    <View className="flex-1 gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-start justify-between gap-two">
        <ThemedText type="smallBold" themeColor="textSecondary" className="flex-1 text-[11px] tracking-wider">
          {label}
        </ThemedText>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-8 w-8 items-center justify-center rounded-two"
        >
          <Ionicons name={icon} size={16} color="#ffffff" />
        </LinearGradient>
      </View>
      <View className="flex-row items-baseline gap-two">
        <ThemedText className="shrink text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </ThemedText>
        {action}
      </View>
    </View>
  );
}
