import { Pressable, ScrollView, View } from "react-native";

import { GradientButton } from "@/components/login/gradient-button";
import { BottomSheet } from "@/components/sale/bottom-sheet";
import {
  OptionGroup,
  type StockOrder,
} from "@/components/stock/stock-filter-sheet";
import { ThemedText } from "@/components/themed-text";
import { Gradients } from "@/constants/theme";
import { isoDateFromToday } from "@/utils/dates";

export type DuePeriod = "all" | "today" | "7" | "30";

const BILL_ORDERS: { value: StockOrder; label: string }[] = [
  { value: "asc", label: "Vencimento mais próximo primeiro" },
  { value: "desc", label: "Vencimento mais distante primeiro" },
];

const DUE_PERIODS: { value: DuePeriod; label: string }[] = [
  { value: "all", label: "Qualquer data" },
  { value: "today", label: "Vencem hoje" },
  { value: "7", label: "Próximos 7 dias" },
  { value: "30", label: "Próximos 30 dias" },
];

/** Período -> filtros `startDueDate`/`endDueDate` da API (yyyy-MM-dd). */
export function duePeriodRange(period: DuePeriod, today = new Date()) {
  if (period === "all") return {};
  const days = period === "today" ? 0 : Number(period);
  return {
    startDueDate: isoDateFromToday(0, today),
    endDueDate: isoDateFromToday(days, today),
  };
}

type BillFilterSheetProps = {
  visible: boolean;
  order: StockOrder;
  period: DuePeriod;
  onChangeOrder: (order: StockOrder) => void;
  onChangePeriod: (period: DuePeriod) => void;
  onClose: () => void;
};

export function BillFilterSheet({
  visible,
  order,
  period,
  onChangeOrder,
  onChangePeriod,
  onClose,
}: BillFilterSheetProps) {
  return (
    <BottomSheet visible={visible} title="Filtros" onClose={onClose}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-four pb-three"
      >
        <OptionGroup
          title="Ordenar por vencimento"
          options={BILL_ORDERS}
          value={order}
          onChange={onChangeOrder}
        />
        <OptionGroup
          title="Vencimento"
          options={DUE_PERIODS}
          value={period}
          onChange={onChangePeriod}
        />
      </ScrollView>
      <View className="flex-row gap-three">
        <Pressable
          onPress={() => {
            onChangeOrder("asc");
            onChangePeriod("all");
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
