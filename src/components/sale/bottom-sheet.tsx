import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Sheet anchored to the bottom with a fixed height, so a search field at its
 * top stays visible above the keyboard.
 */
export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className="h-[75%] gap-three rounded-t-four bg-paper px-four pt-three"
        style={{ paddingBottom: insets.bottom + Spacing.three }}
      >
        <View className="h-one w-10 self-center rounded-half bg-surface-selected" />
        <View className="flex-row items-center justify-between">
          <ThemedText className="text-lg font-bold">{title}</ThemedText>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Ionicons name="close" size={22} color="#60646C" />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}
