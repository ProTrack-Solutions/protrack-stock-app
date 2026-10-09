import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { SaleListItem } from "@/interfaces/sale.interface";
import { formatCurrency, formatNumber } from "@/utils/format";

import { hasCustomer, salePaymentLabel, SaleStatusBadge } from "./sale-status";

/** ISO -> "05/10/2026 às 14:32" */
function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "2026-11-05" -> "05/11/2026" */
const formatDueDate = (value: string) => {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d.slice(0, 2)}/${m}/${y}` : value;
};

type SaleDetailSheetProps = {
  item: SaleListItem | null;
  onClose: () => void;
};

export function SaleDetailSheet({ item, onClose }: SaleDetailSheetProps) {
  const insets = useSafeAreaInsets();
  if (!item) return null;

  const { sale, products, installment } = item;
  const withCustomer =
    hasCustomer(sale.customer_id) && Boolean(sale.customer_name);
  const installments = [...installment].sort(
    (a, b) => a.installment_number - b.installment_number,
  );

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40"
        onPress={onClose}
        accessibilityLabel="Fechar"
      />
      <View
        className="max-h-[88%] rounded-t-four bg-paper px-four pt-three"
        style={{ paddingBottom: insets.bottom + Spacing.three }}
      >
        <View className="mb-three h-one w-10 self-center rounded-half bg-surface-selected" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-three"
        >
          <View className="flex-row items-start gap-three">
            <View className="flex-1 gap-half">
              <ThemedText type="code" themeColor="textSecondary">
                Venda #{sale.sale_id.slice(0, 8)}
              </ThemedText>
              <ThemedText
                className={`text-lg font-bold ${withCustomer ? "" : "text-muted"}`}
                numberOfLines={2}
              >
                {withCustomer ? sale.customer_name : "Consumidor final"}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateTime(sale.sale_at)} ·{" "}
                {salePaymentLabel(sale.payment_method)}
              </ThemedText>
            </View>
            <SaleStatusBadge status={sale.sale_status} />
          </View>

          <View className="rounded-three border border-line">
            <View className="px-three pt-three pb-one">
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                className="text-[11px] tracking-widest"
              >
                PRODUTOS
              </ThemedText>
            </View>
            {products.map((p) => (
              <View
                key={p.sale_item_id}
                className="flex-row items-center gap-three px-three py-two"
              >
                <View className="flex-1">
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {p.product_name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatNumber(p.quantity)} × {formatCurrency(p.unit_price)}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold">
                  {formatCurrency(p.quantity * p.unit_price - p.item_discount)}
                </ThemedText>
              </View>
            ))}
            <View className="gap-one border-t-hairline border-line p-three">
              <TotalLine
                label="Subtotal"
                value={formatCurrency(sale.subtotal)}
              />
              {sale.discount_amount > 0 && (
                <TotalLine
                  label="Desconto"
                  value={`−${formatCurrency(sale.discount_amount)}`}
                  valueClass="text-danger"
                />
              )}
              {sale.down_payments > 0 && (
                <TotalLine
                  label="Entrada"
                  value={formatCurrency(sale.down_payments)}
                />
              )}
              <View className="flex-row items-center justify-between pt-one">
                <ThemedText className="font-bold">Total</ThemedText>
                <ThemedText className="text-lg font-bold">
                  {formatCurrency(sale.total_amount)}
                </ThemedText>
              </View>
            </View>
          </View>

          {installments.length > 0 && (
            <View className="rounded-three border border-line">
              <View className="px-three pt-three pb-one">
                <ThemedText
                  type="smallBold"
                  themeColor="textSecondary"
                  className="text-[11px] tracking-widest"
                >
                  PARCELAS ({installments.length})
                </ThemedText>
              </View>
              {installments.map((i, index) => (
                <View
                  key={i.installment_id}
                  className={`flex-row items-center gap-three px-three py-two ${
                    index < installments.length - 1
                      ? "border-b-hairline border-line"
                      : ""
                  }`}
                >
                  <View className="flex-1">
                    <ThemedText type="smallBold">
                      {i.installment_number}ª parcela
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Vence em {formatDueDate(i.due_date)}
                    </ThemedText>
                  </View>
                  {/* A API manda o saldo restante da parcela, não o valor original. */}
                  <View className="items-end">
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      className="text-xs"
                    >
                      Saldo
                    </ThemedText>
                    <ThemedText type="smallBold">
                      {formatCurrency(i.installment_balance)}
                    </ThemedText>
                  </View>
                  <SaleStatusBadge status={i.installment_status} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function TotalLine({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" className={valueClass}>
        {value}
      </ThemedText>
    </View>
  );
}
