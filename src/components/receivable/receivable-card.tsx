import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type {
  Receivable,
  ReceivableStatus,
} from "@/interfaces/receivable.interface";
import { formatCurrency } from "@/utils/format";

const STATUS: Record<
  ReceivableStatus,
  { label: string; box: string; text: string }
> = {
  overdue: {
    label: "Vencido",
    box: "bg-rose-50 border-rose-300",
    text: "text-rose-700",
  },
  pending: {
    label: "Pendente",
    box: "bg-amber-50 border-amber-300",
    text: "text-amber-700",
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
};

export const RECEIVABLE_STATUS_OPTIONS = (
  ["overdue", "pending", "partial", "paid"] as const
).map((value) => ({
  value,
  label: STATUS[value].label,
}));

/** "2026-08-14" -> "14/08/2026" */
export function formatDueDate(value: string) {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d.slice(0, 2)}/${m}/${y}` : value;
}

type ReceivableCardProps = {
  receivable: Receivable;
  onSettle: () => void;
  onRemind: () => void;
  reminding: boolean;
};

export function ReceivableCard({
  receivable: r,
  onSettle,
  onRemind,
  reminding,
}: ReceivableCardProps) {
  const status = STATUS[r.status] ?? STATUS.pending;
  const overdue = r.status === "overdue";
  const open = r.balance > 0;

  return (
    <View
      className={`gap-three rounded-three bg-paper p-three border ${overdue ? "border-rose-200" : "border-line"}`}
    >
      <View className="flex-row items-start gap-two">
        <View className="flex-1 gap-half">
          <ThemedText className="font-bold" numberOfLines={1}>
            {r.customer_name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Parcela {r.installment_number}/{r.total_installments} · Venda #
            {r.sale_id.slice(0, 8)}
          </ThemedText>
        </View>
        <View className={`rounded-full border px-two py-half ${status.box}`}>
          <ThemedText type="smallBold" className={`text-xs ${status.text}`}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      <View className="flex-row gap-two">
        <Value label="VALOR" value={formatCurrency(r.total_amount)} />
        <Value
          label="RESTANTE"
          value={formatCurrency(r.balance)}
          strong={open}
          muted={!open}
        />
        <Value label="VENCIMENTO" value={formatDueDate(r.due_date)} />
      </View>

      {overdue && r.days_overdue > 0 && (
        <ThemedText type="smallBold" className="text-danger">
          {r.days_overdue} {r.days_overdue === 1 ? "dia" : "dias"} em atraso
        </ThemedText>
      )}

      {open && (
        <View className="flex-row gap-two">
          <Pressable
            onPress={onSettle}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center gap-two rounded-two bg-brand py-three active:opacity-80"
          >
            <Ionicons name="checkmark" size={18} color="#ffffff" />
            <ThemedText type="smallBold" className="text-white">
              Baixar
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={onRemind}
            disabled={reminding}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center gap-two rounded-two border border-line bg-paper py-three active:bg-surface"
          >
            {reminding ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Ionicons name="logo-whatsapp" size={18} color="#047857" />
                <ThemedText type="smallBold">Lembrete</ThemedText>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Value({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <View className="flex-1 gap-half">
      <ThemedText
        type="smallBold"
        themeColor="textSecondary"
        className="text-[10px] tracking-wider"
      >
        {label}
      </ThemedText>
      <ThemedText
        type={strong ? "smallBold" : "small"}
        className={muted ? "text-placeholder" : "text-ink"}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </ThemedText>
    </View>
  );
}
