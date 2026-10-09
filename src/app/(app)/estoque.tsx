import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarcodeScanner } from "@/components/product/barcode-scanner";
import { SearchInput } from "@/components/sale/search-input";
import { CategoryChips } from "@/components/stock/category-chips";
import {
  periodStartDate,
  StockFilterSheet,
  type CreatedPeriod,
  type StockOrder,
} from "@/components/stock/stock-filter-sheet";
import { StockProductRow } from "@/components/stock/stock-product-row";
import { StockStats } from "@/components/stock/stock-stats";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BrandColor, Gradients, Spacing } from "@/constants/theme";
import { useSideMenu } from "@/contexts/side-menu-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { LOW_STOCK_LIMIT, useStock } from "@/hooks/use-stock";
import type { ProductCategory } from "@/interfaces/product.interface";
import { ListProductCategories } from "@/service/product.service";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export default function StockScreen() {
  const insets = useSafeAreaInsets();
  const sideMenu = useSideMenu();
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim(), 400);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [lowStock, setLowStock] = useState(false);
  const [order, setOrder] = useState<StockOrder>("asc");
  const [period, setPeriod] = useState<CreatedPeriod>("all");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const startDate = useMemo(() => periodStartDate(period), [period]);
  const { products, stats, loading, loadingMore, refreshing, error, refresh, loadMore } = useStock({
    search,
    orderBy: order,
    startDate,
    categoryId,
    lowStock,
  });

  useEffect(() => {
    ListProductCategories()
      .then((list) => setCategories(list.filter((c) => c.status !== "INACTIVE" && c.status !== "DELETED")))
      .catch(() => setCategories([]));
  }, []);

  // Recarrega ao voltar para a tela (ex: depois de cadastrar um produto).
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refresh();
      focusedOnce.current = true;
    }, [refresh]),
  );

  const categoryColors = useMemo(
    () => new Map(categories.map((c) => [c.id, HEX_COLOR.test(c.color) ? c.color : undefined])),
    [categories],
  );

  const hasFilters = order !== "asc" || period !== "all";
  const filteredLocally = categoryId !== null || lowStock;
  const count = filteredLocally ? products.length : (stats?.productsCount ?? 0);

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Estoque"
        subtitle="Produtos cadastrados no sistema."
        leading={{ type: "menu", onPress: sideMenu.open }}
      />

      <View
        className="flex-row gap-two px-three py-three border-b-hairline border-line"
      >
        <View className="flex-1">
          <SearchInput
            placeholder="Nome ou código de barras..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
        <IconButton icon="scan-outline" label="Ler código de barras" onPress={() => setScannerOpen(true)} />
        <IconButton icon="filter-outline" label="Filtros" onPress={() => setFilterOpen(true)} dot={hasFilters} />
      </View>

      <FlatList
        data={loading ? [] : products}
        keyExtractor={(p) => p.id}
        contentContainerClassName="w-full max-w-content self-center gap-two p-three"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={BrandColor} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View className="mb-one gap-three">
            {stats && (
              <StockStats
                stats={stats}
                lowStockActive={lowStock}
                onToggleLowStock={() => setLowStock((v) => !v)}
              />
            )}
            <CategoryChips categories={categories} value={categoryId} onChange={setCategoryId} />
            {lowStock && (
              <Pressable
                onPress={() => setLowStock(false)}
                accessibilityRole="button"
                className="flex-row items-center gap-two self-start rounded-full bg-rose-50 px-three py-one active:opacity-70 border border-rose-200"
              >
                <ThemedText type="smallBold" className="text-xs text-rose-700">
                  Estoque baixo (menos de {LOW_STOCK_LIMIT} un)
                </ThemedText>
                <Ionicons name="close" size={14} color="#BE123C" />
              </Pressable>
            )}
            {!loading && !error && (
              <ThemedText type="smallBold" themeColor="textSecondary">
                {count} {count === 1 ? "produto" : "produtos"}
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
              <Ionicons name={error ? "cloud-offline-outline" : "cube-outline"} size={28} color="#60646C" />
              <ThemedText type="small" themeColor="textSecondary" className={`text-center ${error ? "text-red-700" : ""}`}>
                {error ?? "Nenhum produto encontrado."}
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
        renderItem={({ item }) => <StockProductRow product={item} categoryColor={categoryColors.get(item.category_id)} />}
      />

      <Pressable
        onPress={() => router.push("/novo-produto")}
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
            Novo produto
          </ThemedText>
        </LinearGradient>
      </Pressable>

      <StockFilterSheet
        visible={filterOpen}
        order={order}
        period={period}
        onChangeOrder={setOrder}
        onChangePeriod={setPeriod}
        onClose={() => setFilterOpen(false)}
      />

      <BarcodeScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={(code) => {
          setSearchText(code);
          setScannerOpen(false);
        }}
      />
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  dot,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  dot?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-12 items-center justify-center rounded-two bg-paper active:bg-surface border border-line"
    >
      <Ionicons name={icon} size={20} color="#000000" />
      {dot && <View className="absolute right-two top-two h-2 w-2 rounded-full bg-brand" />}
    </Pressable>
  );
}
