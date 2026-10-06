import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";

type ListStateProps = {
  loading: boolean;
  error: string | null;
  emptyMessage: string;
};

/** Conteúdo exibido no lugar da lista: carregando, erro ou vazio. */
export function ListState({ loading, error, emptyMessage }: ListStateProps) {
  if (loading) {
    return (
      <View className="items-center py-five">
        <ActivityIndicator color={BrandColor} />
      </View>
    );
  }

  return (
    <ThemedText
      type="small"
      themeColor="textSecondary"
      className="py-four text-center"
      style={error ? { color: "#B91C1C" } : undefined}
    >
      {error ?? emptyMessage}
    </ThemedText>
  );
}
