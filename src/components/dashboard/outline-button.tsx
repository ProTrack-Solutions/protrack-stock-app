import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";

type OutlineButtonProps = {
  label: string;
  onPress: () => void;
};

export function OutlineButton({ label, onPress }: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="items-center rounded-two bg-gray-50 py-three active:bg-surface border border-line"
    >
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}
