import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { BrandColor, Spacing } from "@/constants/theme";
import type { StockProduct } from "@/interfaces/product.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { DeleteProduct } from "@/service/product.service";
import { formatCurrency, formatNumber } from "@/utils/format";

type StockProductDetailSheetProps = {
  product: StockProduct | null;
  categoryColor?: string;
  onClose: () => void;
  /** Chamado depois de excluir, para a lista recarregar. */
  onChanged: () => void;
};

/** ISO -> "09/10/2026" */
function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1900) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function StockProductDetailSheet({
  product,
  categoryColor = "#64748B",
  onClose,
  onChanged,
}: StockProductDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);

  if (!product) return null;

  const unit = product.unit.toLowerCase();
  const priceSuffix = product.sell_in_bulk ? `/${unit}` : "";
  const margin = product.sale_price - product.cost_price;
  const marginPercent =
    product.cost_price > 0 ? (margin / product.cost_price) * 100 : null;
  const since = formatDate(product.created_at);

  const confirmDelete = () => {
    Alert.alert(
      "Excluir produto?",
      `${product.name} sairá do estoque. Não é possível desfazer pelo app.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await DeleteProduct(product.id);
              onClose();
              onChanged();
            } catch (error) {
              Alert.alert(
                "Erro ao excluir",
                getApiErrorMessage(
                  error,
                  "Não foi possível excluir o produto.",
                ),
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const edit = () => {
    onClose();
    // Espera o Modal fechar antes de trocar de tela (Android/Fabric).
    setTimeout(
      () =>
        router.push({
          pathname: "/editar-produto",
          params: { product: JSON.stringify(product) },
        }),
      300,
    );
  };

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
          <View className="flex-row items-center gap-three">
            <View className="h-14 w-14 items-center justify-center rounded-three bg-brand-soft border border-brand-line">
              <Ionicons name="cube-outline" size={26} color={BrandColor} />
            </View>
            <View className="flex-1 gap-half">
              <ThemedText className="text-lg font-bold" numberOfLines={2}>
                {product.name}
              </ThemedText>
              <View className="flex-row flex-wrap items-center gap-one">
                {product.category_name ? (
                  <View
                    className="rounded-full px-two py-half"
                    style={{ backgroundColor: `${categoryColor}26` }}
                  >
                    <ThemedText
                      type="smallBold"
                      className="text-xs"
                      style={{ color: categoryColor }}
                    >
                      {product.category_name}
                    </ThemedText>
                  </View>
                ) : null}
                {product.size ? (
                  <View className="rounded-one px-two py-half border border-[#C9CCD3]">
                    <ThemedText type="smallBold" className="text-xs">
                      {product.size}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="flex-row gap-two">
            <Highlight
              label="Preço de venda"
              value={`${formatCurrency(product.sale_price)}${priceSuffix}`}
              className="bg-blue-50"
              valueClass="text-blue-700"
            />
            <Highlight
              label="Estoque"
              value={
                product.sell_in_bulk
                  ? `A granel (${unit})`
                  : `${formatNumber(product.quantity)} un`
              }
              className={
                product.sell_in_bulk || product.quantity >= 5
                  ? "bg-emerald-50"
                  : "bg-rose-50"
              }
              valueClass={
                product.sell_in_bulk || product.quantity >= 5
                  ? "text-emerald-700"
                  : "text-rose-700"
              }
            />
          </View>

          <View className="rounded-three border border-line">
            <InfoRow label="Código de barras" value={product.barcode} mono />
            <InfoRow
              label="Preço de custo"
              value={formatCurrency(product.cost_price)}
            />
            <InfoRow
              label="Margem"
              value={
                marginPercent === null
                  ? "—"
                  : `${formatCurrency(margin)} · ${marginPercent.toFixed(0)}%`
              }
              valueClass={
                margin > 0
                  ? "text-emerald-700"
                  : margin < 0
                    ? "text-danger"
                    : undefined
              }
            />
            {product.sell_in_bulk && (
              <InfoRow label="Venda" value={`A granel, por ${unit}`} />
            )}
            <InfoRow label="Descrição" value={product.description} />
            <InfoRow label="Cadastrado em" value={since} last />
          </View>

          <View className="flex-row gap-three">
            <Pressable
              onPress={confirmDelete}
              disabled={deleting}
              accessibilityRole="button"
              className="flex-1 items-center justify-center rounded-three border border-rose-200 bg-rose-50 py-three active:opacity-70"
            >
              {deleting ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <ThemedText type="smallBold" className="text-danger">
                  Excluir
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              onPress={edit}
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center gap-two rounded-three border border-line bg-paper py-three active:bg-surface"
            >
              <Ionicons name="create-outline" size={18} color="#000000" />
              <ThemedText type="smallBold">Editar</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Highlight({
  label,
  value,
  className,
  valueClass,
}: {
  label: string;
  value: string;
  className: string;
  valueClass: string;
}) {
  return (
    <View className={`flex-1 gap-half rounded-three p-three ${className}`}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText
        className={`text-lg font-bold ${valueClass}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </ThemedText>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueClass,
  mono,
  last,
}: {
  label: string;
  value?: string;
  valueClass?: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start gap-three px-three py-three ${last ? "" : "border-b-hairline border-line"}`}
    >
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View className="flex-1 items-end">
        <ThemedText
          type={mono ? "code" : "smallBold"}
          className={["text-right", mono ? "text-sm" : "", valueClass]
            .filter(Boolean)
            .join(" ")}
        >
          {value?.trim() || "—"}
        </ThemedText>
      </View>
    </View>
  );
}
