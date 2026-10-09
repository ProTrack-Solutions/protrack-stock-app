import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchInput } from "@/components/sale/search-input";
import { SaleDetailSheet } from "@/components/sales-list/sale-detail-sheet";
import { SaleRow } from "@/components/sales-list/sale-row";
import { SALE_STATUS_OPTIONS } from "@/components/sales-list/sale-status";
import {
  SalesFilterSheet,
  type PaymentFilter,
} from "@/components/sales-list/sales-filter-sheet";
import {
  periodStartDate,
  type CreatedPeriod,
  type StockOrder,
} from "@/components/stock/stock-filter-sheet";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BrandColor, Gradients, Spacing } from "@/constants/theme";
import { useSideMenu } from "@/contexts/side-menu-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSalesList, type SalesStats } from "@/hooks/use-sales-list";
import type { SaleListItem, SaleStatus } from "@/interfaces/sale.interface";
import { formatCurrency, formatNumber } from "@/utils/format";

const MONTHS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

type StatusFilter = SaleStatus | "all";
const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  ...SALE_STATUS_OPTIONS,
];

type Row =
  | { type: "day"; key: string; label: string; total: number }
  | { type: "sale"; key: string; item: SaleListItem };

/** Agrupa por dia (horário local); o total do dia não conta vendas canceladas. */
function groupByDay(sales: SaleListItem[]): Row[] {
  const rows: Row[] = [];
  let current: Extract<Row, { type: "day" }> | null = null;
  for (const item of sales) {
    const date = new Date(item.sale.sale_at);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!current || current.key !== key) {
      current = {
        type: "day",
        key,
        label: `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
        total: 0,
      };
      rows.push(current);
    }
    if (item.sale.sale_status !== "canceled")
      current.total += item.sale.total_amount;
    rows.push({ type: "sale", key: item.sale.sale_id, item });
  }
  return rows;
}

export default function SalesListScreen() {
  const insets = useSafeAreaInsets();
  const sideMenu = useSideMenu();
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim(), 400);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [order, setOrder] = useState<StockOrder>("desc");
  const [period, setPeriod] = useState<CreatedPeriod>("all");
  const [payment, setPayment] = useState<PaymentFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<SaleListItem | null>(null);

  // "#a477c6" busca pelo número da venda: a API não pesquisa por id, então o filtro é local.
  const idQuery = /^#[0-9a-f-]*$/i.test(search)
    ? search.slice(1).toLowerCase()
    : null;
  const saleStartDate = useMemo(() => periodStartDate(period), [period]);
  const {
    sales,
    stats,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  } = useSalesList({
    search: idQuery === null ? search : "",
    orderBy: order,
    saleStatus: status === "all" ? undefined : status,
    paymentMethod: payment === "all" ? undefined : payment,
    saleStartDate,
  });

  // Recarrega ao voltar para a tela (ex: depois de cadastrar uma venda).
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refresh();
      focusedOnce.current = true;
    }, [refresh]),
  );

  const visible = useMemo(
    () =>
      idQuery ? sales.filter((s) => s.sale.sale_id.startsWith(idQuery)) : sales,
    [sales, idQuery],
  );
  const rows = useMemo(() => groupByDay(visible), [visible]);
  const hasFilters = order !== "desc" || period !== "all" || payment !== "all";
  const filtered = Boolean(search) || hasFilters || status !== "all";
  const count = !filtered && stats ? stats.salesCount : visible.length;
  const more = filtered && hasMore;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Vendas"
        subtitle="Vendas realizadas."
        leading={{ type: "menu", onPress: sideMenu.open }}
      />

      <View className="flex-row gap-two px-three py-three border-b-hairline border-line">
        <View className="flex-1">
          <SearchInput
            placeholder="Cliente, produto ou #nº da venda..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCapitalize="none"
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
        data={loading ? [] : rows}
        keyExtractor={(row) => `${row.type}-${row.key}`}
        contentContainerClassName="w-full max-w-content self-center gap-two p-three"
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
            {stats && <SalesStatsGrid stats={stats} />}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-three"
              contentContainerClassName="gap-two px-three"
            >
              {STATUSES.map((option) => {
                const isSelected = option.value === status;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className={`rounded-full border px-four py-two active:opacity-70 ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-line bg-paper"
                    }`}
                  >
                    <ThemedText
                      type="smallBold"
                      className={isSelected ? "text-white" : "text-ink"}
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
                {more ? "+" : ""} {count === 1 && !more ? "venda" : "vendas"}
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
                name={error ? "cloud-offline-outline" : "receipt-outline"}
                size={28}
                color="#60646C"
              />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                className={`text-center ${error ? "text-red-700" : ""}`}
              >
                {error ?? "Nenhuma venda encontrada."}
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
        renderItem={({ item: row }) =>
          row.type === "day" ? (
            <View className="mt-two flex-row items-center justify-between px-one">
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                className="text-xs tracking-widest"
              >
                {row.label}
              </ThemedText>
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                className="text-xs"
              >
                {formatCurrency(row.total)}
              </ThemedText>
            </View>
          ) : (
            <SaleRow item={row.item} onPress={() => setSelected(row.item)} />
          )
        }
      />

      <Pressable
        onPress={() => router.push("/nova-venda")}
        accessibilityRole="button"
        className="absolute right-four active:opacity-85"
        style={{
          bottom: insets.bottom + Spacing.four,
          shadowColor: "#2563EB",
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
          className="flex-row items-center gap-two rounded-full px-four py-three"
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <ThemedText type="smallBold" className="text-white">
            Nova venda
          </ThemedText>
        </LinearGradient>
      </Pressable>

      <SaleDetailSheet item={selected} onClose={() => setSelected(null)} />

      <SalesFilterSheet
        visible={filterOpen}
        order={order}
        period={period}
        payment={payment}
        onChangeOrder={setOrder}
        onChangePeriod={setPeriod}
        onChangePayment={setPayment}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

function SalesStatsGrid({ stats }: { stats: SalesStats }) {
  return (
    <View className="gap-two">
      <View className="flex-row gap-two">
        <StatCard
          label="Total de Vendas"
          value={formatNumber(stats.salesCount)}
          valueClass="text-ink"
        />
        <StatCard
          label="Faturado"
          value={formatCurrency(stats.totalInvoiced)}
          valueClass="text-blue-600"
        />
      </View>
      <View className="flex-row gap-two">
        <StatCard
          label="Pendente"
          value={formatCurrency(stats.totalPending)}
          valueClass="text-amber-600"
        />
        <StatCard
          label="Canceladas"
          value={formatNumber(stats.salesCanceled)}
          valueClass="text-danger"
        />
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <View className="flex-1 gap-two rounded-three bg-paper p-three border border-line">
      <ThemedText
        type="small"
        themeColor="textSecondary"
        className="text-xs"
        numberOfLines={1}
      >
        {label}
      </ThemedText>
      <ThemedText
        className={`text-xl font-bold ${valueClass}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </ThemedText>
    </View>
  );
}
