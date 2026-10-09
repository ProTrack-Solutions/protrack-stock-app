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
      className="items-center rounded-two bg-[#F9FAFB] py-three active:bg-surface"
      style={{ borderWidth: 1, borderColor: "#E0E1E6" }}
    >
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}
