import { View } from "react-native";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import { formatCurrency, formatPercent } from "@/utils/format";
import { OutlineButton } from "./outline-button";

type StockValueCardProps = {
  stockCost: number;
  inventoryTurnover: number;
  onSeeDetails: () => void;
};

export function StockValueCard({ stockCost, inventoryTurnover, onSeeDetails }: StockValueCardProps) {
  const progress = Math.min(Math.max(inventoryTurnover, 0), 100);

  return (
    <SectionCard title="Valor em Estoque" icon="cube-outline" iconColor="#000000">
      <View className="gap-half">
        <ThemedText className="text-2xl font-bold">{formatCurrency(stockCost)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Total investido
        </ThemedText>
      </View>
      <View className="gap-two">
        <View className="flex-row justify-between">
          <ThemedText type="small">Giro de estoque</ThemedText>
          <ThemedText type="smallBold">{formatPercent(inventoryTurnover)}</ThemedText>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-surface">
          <View
            className="h-full rounded-full bg-brand"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
      <OutlineButton label="Ver Detalhes" onPress={onSeeDetails} />
    </SectionCard>
  );
}
