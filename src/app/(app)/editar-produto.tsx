import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { ProductFormScreen } from "@/components/product/product-form-screen";
import { ThemedText } from "@/components/themed-text";
import type { StockProduct } from "@/interfaces/product.interface";

/**
 * O produto chega serializado em `product`: o GET /product/:id da API não devolve
 * `sell_in_bulk`, `unit` nem o nome da categoria, que vêm da lista do estoque.
 */
export default function EditProductScreen() {
  const { product: raw } = useLocalSearchParams<{ product: string }>();

  let product: StockProduct | null = null;
  try {
    product = raw ? (JSON.parse(raw) as StockProduct) : null;
  } catch {
    product = null;
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-surface p-four">
        <ThemedText themeColor="textSecondary">
          Produto não encontrado.
        </ThemedText>
      </View>
    );
  }
  return <ProductFormScreen key={product.id} product={product} />;
}
