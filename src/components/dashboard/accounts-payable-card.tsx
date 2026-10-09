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
    { label: "Vencidas", value: summary.total_overdue, colorClass: "text-danger" },
    { label: "Vencem hoje", value: summary.total_scheduled, colorClass: "text-success" },
    { label: "Próximos 7 dias", value: summary.total_quantity, colorClass: "text-ink" },
  ];

  return (
    <SectionCard title="Contas a Pagar" icon="calendar-outline" iconColor="#000000">
      <View className="gap-half">
        <ThemedText className="text-2xl font-bold text-danger">
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
            <ThemedText type="smallBold" className={row.colorClass}>
              {formatCurrency(row.value ?? 0)}
            </ThemedText>
          </View>
        ))}
      </View>
      <OutlineButton label="Gerenciar Contas" onPress={onManage} />
    </SectionCard>
  );
}
