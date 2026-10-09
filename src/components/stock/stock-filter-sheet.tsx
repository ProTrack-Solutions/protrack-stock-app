import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { GradientButton } from "@/components/login/gradient-button";
import { BottomSheet } from "@/components/sale/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { BrandColor, Gradients } from "@/constants/theme";

export type StockOrder = "asc" | "desc";
export type CreatedPeriod = "all" | "7" | "30" | "90";

const ORDERS: { value: StockOrder; label: string }[] = [
  { value: "asc", label: "Mais antigos primeiro" },
  { value: "desc", label: "Mais recentes primeiro" },
];

const PERIODS: { value: CreatedPeriod; label: string }[] = [
  { value: "all", label: "Qualquer data" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

/** "30" -> data de 30 dias atrás em yyyy-MM-dd (filtro `startDate` da API). */
export function periodStartDate(period: CreatedPeriod) {
  if (period === "all") return undefined;
  const date = new Date();
  date.setDate(date.getDate() - Number(period));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

type StockFilterSheetProps = {
  visible: boolean;
  order: StockOrder;
  period: CreatedPeriod;
  onChangeOrder: (order: StockOrder) => void;
  onChangePeriod: (period: CreatedPeriod) => void;
  onClose: () => void;
};

export function StockFilterSheet({
  visible,
  order,
  period,
  onChangeOrder,
  onChangePeriod,
  onClose,
}: StockFilterSheetProps) {
  return (
    <BottomSheet visible={visible} title="Filtros" onClose={onClose}>
      <View className="flex-1 gap-four">
        <OptionGroup title="Ordenar por cadastro" options={ORDERS} value={order} onChange={onChangeOrder} />
        <OptionGroup title="Cadastrados em" options={PERIODS} value={period} onChange={onChangePeriod} />
      </View>
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
        <GradientButton label="Aplicar" colors={Gradients.primary} onPress={onClose} className="flex-1" />
      </View>
    </BottomSheet>
  );
}

function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="gap-two">
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`flex-row items-center justify-between rounded-two border px-three py-three active:opacity-70 ${
              selected ? "border-brand bg-brand-soft" : "border-line bg-paper"
            }`}
          >
            <ThemedText className={selected ? "text-brand" : undefined}>{option.label}</ThemedText>
            {selected && <Ionicons name="checkmark-circle" size={20} color={BrandColor} />}
          </Pressable>
        );
      })}
    </View>
  );
}
