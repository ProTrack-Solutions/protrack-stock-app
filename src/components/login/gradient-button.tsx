import { Ionicons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from '@/components/ui/linear-gradient';
import { Gradients } from '@/constants/theme';

type GradientButtonProps = PressableProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  colors?: readonly [string, string, ...string[]];
};

export function GradientButton({
  label,
  icon,
  colors = Gradients.brand,
  className,
  ...pressableProps
}: GradientButtonProps) {
  return (
    <Pressable
      className={['active:opacity-85', className].filter(Boolean).join(' ')}
      {...pressableProps}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center justify-center gap-two rounded-two py-three">
        <ThemedText type="smallBold" className="text-white">
          {label}
        </ThemedText>
        {icon && <Ionicons name={icon} size={16} color="#ffffff" />}
      </LinearGradient>
    </Pressable>
  );
}
