import { Pressable, ScrollView, View } from "react-native";

import { GradientButton } from "@/components/login/gradient-button";
import { BottomSheet } from "@/components/sale/bottom-sheet";
import {
  OptionGroup,
  ORDERS,
  PERIODS,
  type CreatedPeriod,
  type StockOrder,
} from "@/components/stock/stock-filter-sheet";
import { ThemedText } from "@/components/themed-text";
import { Gradients } from "@/constants/theme";
import type { PaymentMethod } from "@/interfaces/sale.interface";

import { salePaymentLabel } from "./sale-status";

export type PaymentFilter = PaymentMethod | "all";

const PAYMENT_OPTIONS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  ...(
    [
      "cash",
      "pix",
      "credit_card",
      "debit_card",
      "bank_transfer",
      "installments",
      "other",
    ] as const
  ).map((value) => ({ value, label: salePaymentLabel(value) })),
];

const SALE_ORDERS = ORDERS.map((o) => ({
  ...o,
  label:
    o.value === "desc" ? "Mais recentes primeiro" : "Mais antigas primeiro",
}));

const SALE_PERIODS = PERIODS.map((p) =>
  p.value === "all" ? { ...p, label: "Qualquer data" } : p,
);

type SalesFilterSheetProps = {
  visible: boolean;
  order: StockOrder;
  period: CreatedPeriod;
  payment: PaymentFilter;
  onChangeOrder: (order: StockOrder) => void;
  onChangePeriod: (period: CreatedPeriod) => void;
  onChangePayment: (payment: PaymentFilter) => void;
  onClose: () => void;
};

export function SalesFilterSheet({
  visible,
  order,
  period,
  payment,
  onChangeOrder,
  onChangePeriod,
  onChangePayment,
  onClose,
}: SalesFilterSheetProps) {
  return (
    <BottomSheet visible={visible} title="Filtros" onClose={onClose}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-four pb-three"
      >
        <OptionGroup
          title="Ordenar por data da venda"
          options={SALE_ORDERS}
          value={order}
          onChange={onChangeOrder}
        />
        <OptionGroup
          title="Vendas feitas em"
          options={SALE_PERIODS}
          value={period}
          onChange={onChangePeriod}
        />
        <OptionGroup
          title="Forma de pagamento"
          options={PAYMENT_OPTIONS}
          value={payment}
          onChange={onChangePayment}
        />
      </ScrollView>
      <View className="flex-row gap-three">
        <Pressable
          onPress={() => {
            onChangeOrder("desc");
            onChangePeriod("all");
            onChangePayment("all");
          }}
          className="items-center justify-center rounded-two bg-paper px-four active:bg-surface border border-line"
          accessibilityRole="button"
        >
          <ThemedText type="smallBold">Limpar</ThemedText>
        </Pressable>
        <GradientButton
          label="Aplicar"
          colors={Gradients.primary}
          onPress={onClose}
          className="flex-1"
        />
      </View>
    </BottomSheet>
  );
}
