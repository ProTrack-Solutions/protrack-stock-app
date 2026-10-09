import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeatureItem } from '@/components/login/feature-item';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from '@/components/ui/linear-gradient';
import { Gradients, Spacing } from '@/constants/theme';

const features = [
  {
    icon: 'bar-chart-outline',
    title: 'Gestão completa',
    description: 'Vendas, estoque e financeiro em um só lugar',
  },
  {
    icon: 'flash-outline',
    title: 'Rápido e intuitivo',
    description: 'Fluxos pensados para o dia a dia da sua equipe',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Seguro',
    description: 'Seus dados protegidos com criptografia',
  },
] as const;

/**
 * Brand panel shown above the login form: logo, pitch copy and a short list
 * of value props. Purely presentational.
 */
export function LoginHero() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={Gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="gap-four px-four pb-four rounded-b-four"
      style={{ paddingTop: insets.top + Spacing.four }}>
      <View className="h-10 w-10 items-center justify-center rounded-two bg-white/[0.18]">
        <Ionicons name="trending-up" size={22} color="#ffffff" />
      </View>

      <View className="gap-two">
        <ThemedText type="subtitle" className="text-white text-[26px] leading-8">
          Sistema de gestão empresarial
        </ThemedText>
        <ThemedText type="title" className="text-white/90 text-[22px] leading-7">
          ProTrack Gerencial
        </ThemedText>
        <ThemedText className="text-white/85">
          Acesse sua conta e continue gerenciando seu negócio com controle, eficiência e
          crescimento garantidos.
        </ThemedText>
      </View>

      <View className="gap-two">
        {features.map((feature) => (
          <FeatureItem key={feature.title} {...feature} />
        ))}
      </View>
    </LinearGradient>
  );
}
