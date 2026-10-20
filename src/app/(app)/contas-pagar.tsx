import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BillCard, BILL_STATUS_OPTIONS } from "@/components/payable/bill-card";
import {
  BillFilterSheet,
  duePeriodRange,
  type DuePeriod,
} from "@/components/payable/bill-filter-sheet";
import {
  BillListSkeleton,
  BillSummarySkeleton,
} from "@/components/payable/bill-skeleton";
import { NewBillSheet } from "@/components/payable/new-bill-sheet";
import { SearchInput } from "@/components/sale/search-input";
import type { StockOrder } from "@/components/stock/stock-filter-sheet";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BrandColor, Gradients } from "@/constants/theme";
import { useSideMenu } from "@/contexts/side-menu-context";
import {
  useBillsPayable,
  type BillsPayableSummary,
} from "@/hooks/use-bills-payable";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { BillStatus } from "@/interfaces/bills-payable.interface";
import { formatCurrency, formatNumber } from "@/utils/format";

type StatusFilter = BillStatus | "all";
const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  ...BILL_STATUS_OPTIONS,
];

export default function BillsPayableScreen() {
  const insets = useSafeAreaInsets();
  const sideMenu = useSideMenu();
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim(), 400);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [order, setOrder] = useState<StockOrder>("asc");
  const [period, setPeriod] = useState<DuePeriod>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const {
    bills,
    summary,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  } = useBillsPayable({
    search,
    status: status === "all" ? undefined : status,
    orderBy: order,
    ...duePeriodRange(period),
  });

  // Recarrega ao voltar para a tela.
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refresh();
      focusedOnce.current = true;
    }, [refresh]),
  );

  const hasFilters = order !== "asc" || period !== "all";
  const filtered = Boolean(search) || status !== "all" || period !== "all";
  const count = !filtered && summary ? summary.accountsCount : bills.length;
  const more = filtered && hasMore;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Contas a Pagar"
        subtitle="Pagamentos a fornecedores."
        leading={{ type: "menu", onPress: sideMenu.open }}
      />

      <View className="flex-row gap-two px-three py-three border-b-hairline border-line">
        <View className="flex-1">
          <SearchInput
            placeholder="Fornecedor ou descrição..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={() => setFilterOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          className="w-12 items-center justify-center rounded-two bg-paper active:bg-surface border border-line"
        >
          <Ionicons name="filter-outline" size={20} color="#000000" />
          {hasFilters && (
            <View className="absolute right-two top-two h-2 w-2 rounded-full bg-brand" />
          )}
        </Pressable>
      </View>

      <FlatList
        data={loading ? [] : bills}
        keyExtractor={(b) => b.id}
        contentContainerClassName="w-full max-w-content self-center gap-two p-three"
        // Espaço para o botão flutuante não cobrir o último card.
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
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
            {!summary && loading && <BillSummarySkeleton />}
            {summary && <SummaryCard summary={summary} />}

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
            <BillListSkeleton />
          ) : (
            <View className="items-center gap-two py-five">
              <Ionicons
                name={error ? "cloud-offline-outline" : "document-text-outline"}
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
        renderItem={({ item }) => <BillCard bill={item} />}
      />

      <Pressable
        onPress={() => setNewOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Nova conta"
        className="absolute right-four active:opacity-85"
        style={{
          bottom: insets.bottom + 20,
          shadowColor: BrandColor,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center gap-two rounded-full px-five py-three"
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <ThemedText type="smallBold" className="text-white">
            Nova conta
          </ThemedText>
        </LinearGradient>
      </Pressable>

      <BillFilterSheet
        visible={filterOpen}
        order={order}
        period={period}
        onChangeOrder={setOrder}
        onChangePeriod={setPeriod}
        onClose={() => setFilterOpen(false)}
      />

      <NewBillSheet
        visible={newOpen}
        onClose={() => setNewOpen(false)}
        onDone={refresh}
      />
    </View>
  );
}

function SummaryCard({ summary }: { summary: BillsPayableSummary }) {
  return (
    <View className="gap-three rounded-four border border-line bg-paper p-four">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-half">
          <ThemedText type="small" themeColor="textSecondary">
            Total a Pagar
          </ThemedText>
          <ThemedText
            className="text-[28px] leading-9 font-bold"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(summary.totalPayable)}
          </ThemedText>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-two bg-rose-50">
          <Ionicons name="logo-usd" size={20} color="#E11D48" />
        </View>
      </View>
      <View className="flex-row gap-two">
        <Tile
          label="Vencidas"
          value={formatCurrency(summary.totalOverdue)}
          box="bg-rose-50 border-rose-200"
          text="text-rose-600"
        />
        <Tile
          label="Agendados"
          value={formatCurrency(summary.totalScheduled)}
          box="bg-blue-50 border-blue-200"
          text="text-blue-700"
        />
        <Tile
          label="Contas"
          value={formatNumber(summary.accountsCount)}
          box="bg-paper border-line"
          text="text-ink"
        />
      </View>
    </View>
  );
}

function Tile({
  label,
  value,
  box,
  text,
}: {
  label: string;
  value: string;
  box: string;
  text: string;
}) {
  return (
    <View className={`flex-1 gap-half rounded-three border p-three ${box}`}>
      <ThemedText type="small" className={`text-xs ${text}`}>
        {label}
      </ThemedText>
      <ThemedText
        className={`font-bold ${text}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </ThemedText>
    </View>
  );
}
