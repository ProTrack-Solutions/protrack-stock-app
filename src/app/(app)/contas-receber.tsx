import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PaymentSheet,
  type PaymentPreset,
} from "@/components/receivable/payment-sheet";
import {
  formatDueDate,
  ReceivableCard,
  RECEIVABLE_STATUS_OPTIONS,
} from "@/components/receivable/receivable-card";
import { SearchInput } from "@/components/sale/search-input";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BrandColor, Gradients } from "@/constants/theme";
import { useSideMenu } from "@/contexts/side-menu-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useReceivables,
  type ReceivableSummary,
} from "@/hooks/use-receivables";
import type {
  Receivable,
  ReceivableStatus,
} from "@/interfaces/receivable.interface";
import { GetCustomer } from "@/service/customer.service";
import { formatCurrency, formatNumber } from "@/utils/format";

type StatusFilter = ReceivableStatus | "all";
const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  ...RECEIVABLE_STATUS_OPTIONS,
];

export default function ReceivablesScreen() {
  const insets = useSafeAreaInsets();
  const sideMenu = useSideMenu();
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim(), 400);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [preset, setPreset] = useState<PaymentPreset | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const {
    receivables,
    summary,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  } = useReceivables({
    search,
    status: status === "all" ? undefined : status,
    orderBy: "asc",
  });

  // Recarrega ao voltar para a tela.
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refresh();
      focusedOnce.current = true;
    }, [refresh]),
  );

  const openPayment = (next: PaymentPreset | null) => {
    setPreset(next);
    setPaymentOpen(true);
  };

  const remind = async (r: Receivable) => {
    setRemindingId(r.id);
    try {
      const customer = await GetCustomer(r.customer_id);
      const phone = (customer.whatsapp || customer.mobile_phone).replace(
        /\D/g,
        "",
      );
      if (!phone) {
        Alert.alert(
          "Sem telefone",
          `${r.customer_name} não tem WhatsApp ou celular cadastrado.`,
        );
        return;
      }
      const firstName = customer.full_name.split(" ")[0];
      const when = r.status === "overdue" ? "venceu em" : "vence em";
      const message =
        `Olá, ${firstName}! Passando para lembrar da parcela ${r.installment_number}/${r.total_installments} ` +
        `no valor de ${formatCurrency(r.balance)}, que ${when} ${formatDueDate(r.due_date)}.`;
      await Linking.openURL(
        `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      );
    } catch {
      Alert.alert(
        "Não foi possível enviar",
        "Verifique a conexão ou se o WhatsApp está instalado.",
      );
    } finally {
      setRemindingId(null);
    }
  };

  const filtered = Boolean(search) || status !== "all";
  const count =
    !filtered && summary ? summary.accountsCount : receivables.length;
  const more = filtered && hasMore;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Contas a Receber"
        subtitle="Parcelas das vendas no crediário."
        leading={{ type: "menu", onPress: sideMenu.open }}
      />

      <View className="px-three py-three border-b-hairline border-line">
        <SearchInput
          placeholder="Buscar por cliente..."
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={loading ? [] : receivables}
        keyExtractor={(r) => r.id}
        contentContainerClassName="w-full max-w-content self-center gap-two p-three"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={BrandColor}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View className="mb-one gap-three">
            {summary && <SummaryCard summary={summary} />}

            <Pressable
              onPress={() => openPayment(null)}
              accessibilityRole="button"
              className="flex-row items-center justify-center gap-two rounded-three border border-brand-line bg-brand-soft py-three active:opacity-70"
            >
              <Ionicons name="cash-outline" size={20} color={BrandColor} />
              <ThemedText type="smallBold" className="text-brand">
                Dar baixa em recebimento
              </ThemedText>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-three"
              contentContainerClassName="gap-two px-three"
            >
              {STATUSES.map((option) => {
                const selected = option.value === status;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-full border px-four py-two active:opacity-70 ${
                      selected
                        ? "border-blue-600 bg-blue-600"
                        : "border-line bg-paper"
                    }`}
                  >
                    <ThemedText
                      type="smallBold"
                      className={selected ? "text-white" : "text-ink"}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {!loading && !error && (
              <ThemedText type="smallBold" themeColor="textSecondary">
                {formatNumber(count)}
                {more ? "+" : ""} {count === 1 && !more ? "conta" : "contas"}
              </ThemedText>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-five">
              <ActivityIndicator color={BrandColor} />
            </View>
          ) : (
            <View className="items-center gap-two py-five">
              <Ionicons
                name={error ? "cloud-offline-outline" : "wallet-outline"}
                size={28}
                color="#60646C"
              />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                className={`text-center ${error ? "text-red-700" : ""}`}
              >
                {error ?? "Nenhuma conta encontrada."}
              </ThemedText>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-three">
              <ActivityIndicator color={BrandColor} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ReceivableCard
            receivable={item}
            reminding={remindingId === item.id}
            onRemind={() => remind(item)}
            onSettle={() =>
              openPayment({
                customerId: item.customer_id,
                customerName: item.customer_name,
                amount: item.balance,
              })
            }
          />
        )}
      />

      <PaymentSheet
        visible={paymentOpen}
        preset={preset}
        onClose={() => setPaymentOpen(false)}
        onDone={refresh}
      />
    </View>
  );
}

function SummaryCard({ summary }: { summary: ReceivableSummary }) {
  return (
    <LinearGradient
      colors={Gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="gap-three rounded-four p-four"
    >
      <View className="flex-row items-start justify-between">
        <View className="gap-half">
          <ThemedText type="small" className="text-white/85">
            Total a receber
          </ThemedText>
          <ThemedText
            className="text-[28px] leading-9 font-bold text-white"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(summary.totalOpen)}
          </ThemedText>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-two bg-white/20">
          <Ionicons name="logo-usd" size={20} color="#ffffff" />
        </View>
      </View>
      <View className="flex-row gap-two">
        <View className="flex-1 gap-half rounded-three bg-white/15 p-three">
          <View className="flex-row items-center gap-one">
            <View className="h-2 w-2 rounded-full bg-rose-300" />
            <ThemedText type="small" className="text-xs text-white/85">
              Contas vencidas
            </ThemedText>
          </View>
          <ThemedText
            className="font-bold text-white"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(summary.totalOverdue)}
          </ThemedText>
        </View>
        <View className="flex-1 gap-half rounded-three bg-white/15 p-three">
          <ThemedText type="small" className="text-xs text-white/85">
            Total de contas
          </ThemedText>
          <ThemedText className="font-bold text-white">
            {formatNumber(summary.accountsCount)}
          </ThemedText>
        </View>
      </View>
    </LinearGradient>
  );
}
