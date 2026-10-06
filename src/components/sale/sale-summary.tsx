import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

type SaleSummaryProps = {
  itemCount: number;
  productCount: number;
  subtotal: number;
  discount: number;
  total: number;
  /** Preenchido apenas no crediário. */
  installments?: { downPayment: number; count: number; value: number };
};

export function SaleSummary({
  itemCount,
  productCount,
  subtotal,
  discount,
  total,
  installments,
}: SaleSummaryProps) {
  return (
    <View className="gap-two rounded-three bg-paper p-three">
      <ThemedText className="mb-one font-bold">Resumo da Venda</ThemedText>
      <Row label="Itens:" value={String(itemCount)} />
      <Row label="Total de Produtos:" value={String(productCount)} />
      <Row label="Subtotal:" value={formatCurrency(subtotal)} />
      <Row label="Desconto:" value={`– ${formatCurrency(discount)}`} valueColor="#DC2626" />
      {installments && (
        <>
          <Row label="Entrada:" value={formatCurrency(installments.downPayment)} />
          <Row
            label="Parcelas:"
            value={`${installments.count}x de ${formatCurrency(installments.value)}`}
          />
        </>
      )}
      <View
        className="mt-one flex-row items-center justify-between pt-three"
        style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: "#E0E1E6" }}
      >
        <ThemedText className="text-lg font-bold">Total:</ThemedText>
        <ThemedText className="text-2xl font-bold" style={{ color: BrandColor }}>{formatCurrency(total)}</ThemedText>
      </View>
    </View>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </ThemedText>
    </View>
  );
}
