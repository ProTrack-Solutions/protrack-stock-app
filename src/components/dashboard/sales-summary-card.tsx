import { View } from "react-native";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import type { SalesSummary } from "@/interfaces/dashboard.interface";
import { formatCurrency } from "@/utils/format";

export function SalesSummaryCard({ summary }: { summary: SalesSummary }) {
  const growth = summary.growth_percentage ?? 0;

  return (
    <SectionCard title="Resumo de Vendas" icon="trending-up" iconColor="#000000">
      <View className="flex-row gap-three">
        <View className="flex-1 gap-one">
          <ThemedText type="small" themeColor="textSecondary">
            Vendas do Mês
          </ThemedText>
          <ThemedText className="text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(summary.current_month_st ?? 0)}
          </ThemedText>
        </View>
        <View className="flex-1 gap-one">
          <ThemedText type="small" themeColor="textSecondary">
            Mês Anterior
          </ThemedText>
          <ThemedText
            className="text-lg font-semibold"
            themeColor="textSecondary"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(summary.last_month_st ?? 0)}
          </ThemedText>
        </View>
      </View>
      <View className="flex-row items-center gap-two">
        <View
          className="rounded-full px-two py-half"
          style={{ backgroundColor: growth <= 0 ? "#EF4444" : "#22C55E" }}
        >
          <ThemedText type="smallBold" className="text-xs text-white">
            {growth > 0 ? "+" : ""}
            {Math.round(growth)}%
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          vs mês anterior
        </ThemedText>
      </View>
    </SectionCard>
  );
}
