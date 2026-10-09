import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { PaymentMethod, SaleStatus } from "@/interfaces/sale.interface";

// O web mostra "Desconhecido" para `partial`, que existe no enum da API.
const STATUS: Record<SaleStatus, { label: string; box: string; text: string }> =
  {
    paid: {
      label: "Pago",
      box: "bg-blue-500 border-blue-500",
      text: "text-white",
    },
    pending: {
      label: "Pendente",
      box: "bg-amber-50 border-amber-300",
      text: "text-amber-700",
    },
    overdue: {
      label: "Atrasado",
      box: "bg-rose-50 border-rose-300",
      text: "text-rose-700",
    },
    scheduled: {
      label: "Agendado",
      box: "bg-sky-50 border-sky-300",
      text: "text-sky-700",
    },
    canceled: {
      label: "Cancelado",
      box: "bg-rose-100 border-rose-200",
      text: "text-rose-700",
    },
    partial: {
      label: "Parcial",
      box: "bg-violet-50 border-violet-300",
      text: "text-violet-700",
    },
  };

export const SALE_STATUS_OPTIONS = (Object.keys(STATUS) as SaleStatus[]).map(
  (value) => ({
    value,
    label: STATUS[value].label,
  }),
);

export function saleStatusLabel(status: SaleStatus) {
  return STATUS[status]?.label ?? "Desconhecido";
}

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const style = STATUS[status] ?? {
    label: "Desconhecido",
    box: "bg-paper border-line",
    text: "text-muted",
  };
  return (
    <View className={`rounded-full border px-two py-half ${style.box}`}>
      <ThemedText type="smallBold" className={`text-xs ${style.text}`}>
        {style.label}
      </ThemedText>
    </View>
  );
}

// Rótulos da listagem (no web, crediário aparece como "Crediário / Parcelado").
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_transfer: "Transferência",
  installments: "Crediário / Parcelado",
  other: "Outro",
};

export function salePaymentLabel(method: PaymentMethod) {
  return PAYMENT_LABELS[method] ?? "—";
}

/** Vendas sem cliente vêm com o UUID zero. */
export function hasCustomer(customerId: string) {
  return Boolean(customerId) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(customerId);
}
