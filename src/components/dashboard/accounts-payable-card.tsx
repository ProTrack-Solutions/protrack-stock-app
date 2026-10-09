import { View } from "react-native";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import type { BillsPayableSummary } from "@/interfaces/dashboard.interface";
import { formatCurrency } from "@/utils/format";
import { OutlineButton } from "./outline-button";

type AccountsPayableCardProps = {
  summary: BillsPayableSummary;
  onManage: () => void;
};

export function AccountsPayableCard({ summary, onManage }: AccountsPayableCardProps) {
  const rows = [
    { label: "Vencidas", value: summary.total_overdue, color: "#DC2626" },
    { label: "Vencem hoje", value: summary.total_scheduled, color: "#2F855A" },
    { label: "Próximos 7 dias", value: summary.total_quantity, color: "#000000" },
  ];

  return (
    <SectionCard title="Contas a Pagar" icon="calendar-outline" iconColor="#000000">
      <View className="gap-half">
        <ThemedText className="text-2xl font-bold" style={{ color: "#DC2626" }}>
          {formatCurrency(summary.total_to_pay ?? 0)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Total pendente
        </ThemedText>
      </View>
      <View className="gap-two">
        {rows.map((row) => (
          <View key={row.label} className="flex-row justify-between">
            <ThemedText type="small">{row.label}</ThemedText>
            <ThemedText type="smallBold" style={{ color: row.color }}>
              {formatCurrency(row.value ?? 0)}
            </ThemedText>
          </View>
        ))}
      </View>
      <OutlineButton label="Gerenciar Contas" onPress={onManage} />
    </SectionCard>
  );
}
