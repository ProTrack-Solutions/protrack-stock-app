import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type {
  BillPayable,
  BillStatus,
} from "@/interfaces/bills-payable.interface";
import { dueDistanceLabel, formatIsoDate } from "@/utils/dates";
import { formatCurrency } from "@/utils/format";

const STATUS: Record<BillStatus, { label: string; box: string; text: string }> =
  {
    pending: {
      label: "Pendente",
      box: "bg-paper border-line",
      text: "text-ink",
    },
    overdue: {
      label: "Vencido",
      box: "bg-rose-50 border-rose-300",
      text: "text-rose-700",
    },
    scheduled: {
      label: "Agendado",
      box: "bg-blue-50 border-blue-300",
      text: "text-blue-700",
    },
    partial: {
      label: "Parcial",
      box: "bg-violet-50 border-violet-300",
      text: "text-violet-700",
    },
    paid: {
      label: "Pago",
      box: "bg-emerald-500 border-emerald-500",
      text: "text-white",
    },
    canceled: {
      label: "Cancelado",
      box: "bg-surface border-line",
      text: "text-placeholder",
    },
  };

export function billStatusLabel(status: BillStatus) {
  return (STATUS[status] ?? STATUS.pending).label;
}

export const BILL_STATUS_OPTIONS = (
  ["pending", "overdue", "scheduled", "paid", "partial"] as const
).map((value) => ({ value, label: STATUS[value].label }));

/** Contas ainda em aberto mostram quanto falta para o vencimento. */
const OPEN: BillStatus[] = ["pending", "overdue", "scheduled", "partial"];

export function BillCard({ bill }: { bill: BillPayable }) {
  const status = STATUS[bill.status] ?? STATUS.pending;
  const settled = !OPEN.includes(bill.status);
  const overdue = bill.status === "overdue";
  const dueDate = bill.scheduled_date || bill.due_date;

  return (
    <View
      testID={`bill-card-${bill.id}`}
      className={`gap-two rounded-three p-three border ${
        settled ? "bg-surface/60 border-line" : overdue ? "bg-paper border-rose-200" : "bg-paper border-line"
      }`}
    >
      <View className="flex-row items-start gap-two">
        <View className="flex-1 gap-half">
          <ThemedText
            className={`font-bold ${settled ? "text-ink/70" : ""}`}
            numberOfLines={1}
          >
            {bill.vendor_name || "Fornecedor"}
          </ThemedText>
          {!!bill.description && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={1}
            >
              {bill.description}
            </ThemedText>
          )}
        </View>
        <View className={`rounded-full border px-two py-half ${status.box}`}>
          <ThemedText type="smallBold" className={`text-xs ${status.text}`}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      {!!bill.category_name && (
        <View className="self-start rounded-full border border-line bg-paper px-two py-half">
          <ThemedText type="smallBold" className="text-xs">
            {bill.category_name}
          </ThemedText>
        </View>
      )}

      <View className="flex-row items-end justify-between gap-two">
        <View className="flex-1 flex-row items-center gap-one">
          <Ionicons name="calendar-outline" size={14} color="#60646C" />
          <ThemedText
            type="small"
            themeColor="textSecondary"
            className={`flex-shrink ${overdue ? "text-rose-700" : ""}`}
            numberOfLines={1}
          >
            {formatIsoDate(dueDate)}
            {!settled && ` · ${dueDistanceLabel(dueDate)}`}
          </ThemedText>
        </View>
        <ThemedText
          className={`text-lg font-bold ${settled ? "text-ink/70" : ""}`}
          numberOfLines={1}
        >
          {formatCurrency(bill.amount)}
        </ThemedText>
      </View>
    </View>
  );
}
