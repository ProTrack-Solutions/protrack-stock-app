import { Pressable, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { ProductCategory } from "@/interfaces/product.interface";

type CategoryChipsProps = {
  categories: ProductCategory[];
  value: string | null;
  onChange: (categoryId: string | null) => void;
};

export function CategoryChips({ categories, value, onChange }: CategoryChipsProps) {
  const options = [{ id: null, name: "Todas" }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-three"
      contentContainerClassName="gap-two px-three"
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id ?? "all"}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`rounded-full border px-four py-two active:opacity-70 ${
              selected ? "border-blue-600 bg-blue-600" : "border-line bg-paper"
            }`}
          >
            <ThemedText type="smallBold" className={selected ? "text-white" : "text-ink"}>
              {option.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
