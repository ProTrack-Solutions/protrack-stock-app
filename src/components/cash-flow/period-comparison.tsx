import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { CashFlowMonth } from "@/interfaces/cash-flow.interface";
import { formatCurrency, formatNumber } from "@/utils/format";

const LABELS: Record<string, string> = {
  "current month": "Mês atual",
  "last month": "Mês passado",
  "last year": "Ano passado",
};

export function PeriodComparison({ months }: { months: CashFlowMonth[] }) {
  const current = months.find((m) => m.mount === "current month");
  const last = months.find((m) => m.mount === "last month");
  // Variação das entradas do mês atual em relação ao mês passado.
  const change =
    current && last && last.total_inflow > 0
      ? ((current.total_inflow - last.total_inflow) / last.total_inflow) * 100
      : null;

  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <ThemedText className="font-bold">Comparativo entre Períodos</ThemedText>
      {months.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Sem dados para comparar.
        </ThemedText>
      ) : (
        months.map((month) => {
          const balance = month.total_inflow - month.total_outflow;
          return (
            <View
              key={month.mount}
              className="gap-two rounded-three bg-surface p-three border border-line"
            >
              <View className="flex-row items-center justify-between gap-two">
                <ThemedText type="smallBold">
                  {LABELS[month.mount] ?? month.mount}
                </ThemedText>
                {month.mount === "current month" && change !== null && (
                  <View
                    className={`rounded-full px-two py-half ${change >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}
                  >
                    <ThemedText
                      type="smallBold"
                      className={`text-xs ${change >= 0 ? "text-emerald-700" : "text-danger"}`}
                    >
                      {change >= 0 ? "+" : ""}
                      {formatNumber(change)}% vs mês passado
                    </ThemedText>
                  </View>
                )}
              </View>
              <View className="flex-row gap-two">
                <Value
                  label="Entradas"
                  value={formatCurrency(month.total_inflow)}
                  valueClass="text-emerald-700"
                />
                <Value
                  label="Saídas"
                  value={formatCurrency(month.total_outflow)}
                  valueClass="text-danger"
                />
                <Value
                  label="Saldo"
                  value={formatCurrency(balance)}
                  valueClass="text-ink"
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

function Value({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <View className="flex-1 gap-half">
      <ThemedText type="small" themeColor="textSecondary" className="text-xs">
        {label}
      </ThemedText>
      <ThemedText
        type="smallBold"
        className={valueClass}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </ThemedText>
    </View>
  );
}
