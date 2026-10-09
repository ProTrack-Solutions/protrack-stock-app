import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { CashFlowCategory } from "@/interfaces/cash-flow.interface";
import { formatCurrency, formatPercent } from "@/utils/format";

type CategoryCardProps = {
  title: string;
  categories: CashFlowCategory[];
  kind: "inflow" | "outflow";
};

export function CategoryCard({ title, categories, kind }: CategoryCardProps) {
  const total = categories.reduce((sum, c) => sum + c.total, 0);
  const barClass = kind === "inflow" ? "bg-emerald-500" : "bg-rose-500";
  const label = kind === "inflow" ? "das entradas" : "das saídas";

  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-center justify-between gap-two">
        <ThemedText className="flex-1 font-bold">{title}</ThemedText>
        {total > 0 && (
          <ThemedText type="smallBold" themeColor="textSecondary">
            {formatCurrency(total)}
          </ThemedText>
        )}
      </View>

      {total <= 0 ? (
        <View className="flex-row items-center gap-three rounded-three border border-dashed border-line bg-surface p-three">
          <View className="h-10 w-10 items-center justify-center rounded-two bg-emerald-50">
            <Ionicons name="checkmark" size={20} color="#047857" />
          </View>
          <View className="flex-1">
            <ThemedText type="smallBold">
              {kind === "inflow"
                ? "Nenhuma entrada no período"
                : "Nenhuma saída no período"}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatCurrency(0)}
            </ThemedText>
          </View>
        </View>
      ) : (
        categories.map((category) => {
          // Percentual sobre a soma das categorias (o da API usa outra base).
          const percent = (category.total / total) * 100;
          return (
            <View key={category.name_category} className="gap-one">
              <View className="flex-row items-center justify-between gap-two">
                <ThemedText
                  type="smallBold"
                  className="flex-1"
                  numberOfLines={1}
                >
                  {category.name_category}
                </ThemedText>
                <ThemedText type="smallBold">
                  {formatCurrency(category.total)}
                </ThemedText>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-surface">
                <View
                  className={`h-full rounded-full ${barClass}`}
                  style={{ width: `${Math.max(percent, 0)}%` }}
                />
              </View>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                className="text-xs"
              >
                {formatPercent(percent, 1)} {label}
              </ThemedText>
            </View>
          );
        })
      )}
    </View>
  );
}
