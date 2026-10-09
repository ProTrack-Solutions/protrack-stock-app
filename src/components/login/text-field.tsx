import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type TextFieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Icon rendered on the right side, e.g. a password visibility toggle. */
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  /** Makes the trailing icon pressable. */
  onTrailingIconPress?: () => void;
  trailingIconAccessibilityLabel?: string;
};

/**
 * Presentational, uncontrolled text field. It owns no state and performs no
 * validation — screens are responsible for wiring behavior on top of it.
 */
export function TextField({
  label,
  icon,
  trailingIcon,
  onTrailingIconPress,
  trailingIconAccessibilityLabel,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <View className="gap-two">
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        className="flex-row items-center gap-two rounded-two border-surface-selected bg-surface px-three py-two"
        style={{ borderWidth: StyleSheet.hairlineWidth }}>
        <Ionicons name={icon} size={18} color="#60646C" />
        <TextInput
          placeholderTextColor="#60646C"
          className={['flex-1 text-base leading-[22px] text-ink', className]
            .filter(Boolean)
            .join(' ')}
          {...inputProps}
        />
        {trailingIcon &&
          (onTrailingIconPress ? (
            <Pressable
              onPress={onTrailingIconPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={trailingIconAccessibilityLabel}>
              <Ionicons name={trailingIcon} size={18} color="#60646C" />
            </Pressable>
          ) : (
            <Ionicons name={trailingIcon} size={18} color="#60646C" />
          ))}
      </View>
    </View>
  );
}
