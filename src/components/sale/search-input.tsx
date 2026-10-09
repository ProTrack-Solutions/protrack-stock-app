import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

export function SearchInput(props: TextInputProps) {
  return (
    <View
      className="flex-row items-center gap-two rounded-two border-surface-selected bg-surface px-three py-two"
      style={{ borderWidth: StyleSheet.hairlineWidth }}
    >
      <Ionicons name="search" size={18} color="#60646C" />
      <TextInput
        placeholderTextColor="#60646C"
        autoCorrect={false}
        className="flex-1 text-base leading-[22px] text-ink"
        {...props}
      />
    </View>
  );
}
