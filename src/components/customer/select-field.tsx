import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable } from "react-native";

import { BottomSheet } from "@/components/sale/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";

type SelectFieldProps<T extends string> = {
  title: string;
  placeholder: string;
  options: readonly { value: T; label: string }[];
  value: string;
  onChange: (value: T) => void;
};

/** Campo de seleção simples: abre as opções em um BottomSheet. */
export function SelectField<T extends string>({
  title,
  placeholder,
  options,
  value,
  onChange,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={title}
        className="flex-row items-center justify-between gap-two rounded-two border border-line bg-field px-three py-three active:bg-surface"
      >
        <ThemedText
          className={`flex-1 ${selected ? "" : "text-placeholder"}`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={18} color="#60646C" />
      </Pressable>

      <BottomSheet visible={open} title={title} onClose={() => setOpen(false)}>
        <FlatList
          data={options}
          keyExtractor={(option) => option.value}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className="flex-row items-center gap-three py-three active:opacity-60 border-b-hairline border-line"
            >
              <ThemedText className="flex-1">{item.label}</ThemedText>
              {item.value === value && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={BrandColor}
                />
              )}
            </Pressable>
          )}
        />
      </BottomSheet>
    </>
  );
}
