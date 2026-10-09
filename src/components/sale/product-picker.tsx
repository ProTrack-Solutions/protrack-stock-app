import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/sale/bottom-sheet";
import { ListState } from "@/components/sale/list-state";
import { SearchInput } from "@/components/sale/search-input";
import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import { useRemoteSearch } from "@/hooks/use-remote-search";
import { Product } from "@/interfaces/sale.interface";
import { SearchProducts } from "@/service/sale.service";
import { formatCurrency } from "@/utils/format";

type ProductPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
};

export function ProductPicker({ visible, onClose, onSelect }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const { results, loading, error } = useRemoteSearch(query, visible, SearchProducts);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <BottomSheet visible={visible} title="Adicionar produto" onClose={close}>
      <SearchInput
        placeholder="Nome ou código de barras"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      <FlatList
        data={loading ? [] : results}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <ListState loading={loading} error={error} emptyMessage="Nenhum produto encontrado." />
        }
        renderItem={({ item }) => {
          const outOfStock = item.quantity <= 0;
          return (
            <Pressable
              onPress={() => {
                onSelect(item);
                close();
              }}
              disabled={outOfStock}
              className={`flex-row items-center gap-three py-three active:opacity-60 ${outOfStock ? "opacity-40" : ""}`}
              style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#E0E1E6" }}
            >
              <View className="flex-1 gap-half">
                <ThemedText>{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" className="text-xs">
                  {[item.barcode, outOfStock ? "Sem estoque" : `${item.quantity} em estoque`]
                    .filter(Boolean)
                    .join(" · ")}
                </ThemedText>
              </View>
              <ThemedText type="smallBold">{formatCurrency(item.sale_price)}</ThemedText>
              <Ionicons name="add-circle" size={24} color={BrandColor} />
            </Pressable>
          );
        }}
      />
    </BottomSheet>
  );
}
