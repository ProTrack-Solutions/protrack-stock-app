import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/sale/bottom-sheet";
import { ListState } from "@/components/sale/list-state";
import { SearchInput } from "@/components/sale/search-input";
import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import { useRemoteSearch } from "@/hooks/use-remote-search";
import { Customer } from "@/interfaces/sale.interface";
import { SearchCustomers } from "@/service/sale.service";

type ClientSelectProps = {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  /** Mensagem de validação exibida abaixo do campo. */
  error?: string;
};

export function ClientSelect({ value, onChange, error }: ClientSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { results, loading, error: loadError } = useRemoteSearch(query, open, SearchCustomers);

  const select = (customer: Customer | null) => {
    onChange(customer);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-two bg-paper px-three py-three active:bg-surface"
        style={{ borderWidth: 1, borderColor: error ? "#DC2626" : "#E0E1E6" }}
        accessibilityRole="button"
      >
        <View className="flex-1 gap-half">
          <ThemedText>{value?.full_name ?? "Selecione o cliente"}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="text-xs">
            {value ? value.cpf || "Cliente identificado" : "Venda sem identificação do cliente"}
          </ThemedText>
        </View>
        <Ionicons name="chevron-down" size={18} color="#60646C" />
      </Pressable>
      {error && (
        <ThemedText type="small" className="text-xs" style={{ color: "#DC2626" }}>
          {error}
        </ThemedText>
      )}

      <BottomSheet visible={open} title="Selecionar cliente" onClose={() => setOpen(false)}>
        <SearchInput
          placeholder="Nome, CPF, e-mail ou telefone"
          value={query}
          onChangeText={setQuery}
        />
        <FlatList
          data={loading ? [] : results}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <ClientRow
              title="Sem cliente"
              subtitle="Venda sem identificação do cliente"
              selected={value === null}
              onPress={() => select(null)}
            />
          }
          ListEmptyComponent={
            <ListState
              loading={loading}
              error={loadError}
              emptyMessage="Nenhum cliente encontrado."
            />
          }
          renderItem={({ item }) => (
            <ClientRow
              title={item.full_name}
              subtitle={item.cpf}
              selected={value?.id === item.id}
              onPress={() => select(item)}
            />
          )}
        />
      </BottomSheet>
    </>
  );
}

function ClientRow({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-three active:opacity-60"
      style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#E0E1E6" }}
    >
      <View className="flex-1 gap-half">
        <ThemedText>{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" className="text-xs">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {selected && <Ionicons name="checkmark-circle" size={20} color={BrandColor} />}
    </Pressable>
  );
}
