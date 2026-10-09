import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/sale/bottom-sheet";
import { ListState } from "@/components/sale/list-state";
import { SearchInput } from "@/components/sale/search-input";
import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import type { ProductCategory } from "@/interfaces/product.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { ListProductCategories } from "@/service/product.service";
import { ERROR_COLOR, INPUT_BORDER } from "./form-field";

type CategorySelectProps = {
  value: ProductCategory | null;
  onChange: (category: ProductCategory) => void;
  error?: string;
};

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Recarrega a cada abertura para refletir categorias criadas no web.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadError(null);
    ListProductCategories()
      .then((list) => {
        if (active) setCategories(list.filter((c) => c.status !== "INACTIVE" && c.status !== "DELETED"));
      })
      .catch((e) => {
        if (active) setLoadError(getApiErrorMessage(e, "Não foi possível carregar as categorias."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const term = query.trim().toLowerCase();
  const filtered = term ? categories.filter((c) => c.name.toLowerCase().includes(term)) : categories;

  const select = (category: ProductCategory) => {
    onChange(category);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-two bg-[#F6F7F9] px-three py-three active:bg-surface"
        style={{ borderWidth: 1, borderColor: error ? ERROR_COLOR : INPUT_BORDER }}
      >
        <ThemedText style={value ? undefined : { color: "#8B8D98" }}>
          {value?.name ?? "Selecione a categoria"}
        </ThemedText>
        <Ionicons name="chevron-down" size={18} color="#60646C" />
      </Pressable>

      <BottomSheet visible={open} title="Selecionar categoria" onClose={() => setOpen(false)}>
        <SearchInput placeholder="Buscar categoria" value={query} onChangeText={setQuery} />
        <FlatList
          data={loading && categories.length === 0 ? [] : filtered}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <ListState loading={loading && categories.length === 0} error={loadError} emptyMessage="Nenhuma categoria encontrada." />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => select(item)}
              className="flex-row items-center gap-three py-three active:opacity-60"
              style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderColor: INPUT_BORDER }}
            >
              <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color || "#94A3B8" }} />
              <ThemedText className="flex-1">{item.name}</ThemedText>
              {value?.id === item.id && <Ionicons name="checkmark-circle" size={20} color={BrandColor} />}
            </Pressable>
          )}
        />
      </BottomSheet>
    </>
  );
}
