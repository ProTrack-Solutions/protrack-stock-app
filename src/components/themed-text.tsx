import { Platform, Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const themeColorClasses: Record<ThemeColor, string> = {
  text: 'text-ink',
  background: 'text-paper',
  backgroundElement: 'text-surface',
  backgroundSelected: 'text-surface-selected',
  textSecondary: 'text-muted',
};

const typeClasses: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base leading-6 font-medium',
  title: 'text-[48px] leading-[52px] font-semibold',
  small: 'text-sm leading-5 font-medium',
  smallBold: 'text-sm leading-5 font-bold',
  subtitle: 'text-[32px] leading-[44px] font-semibold',
  link: 'text-sm leading-[30px]',
  linkPrimary: 'text-sm leading-[30px] text-brand',
  code: `font-mono text-xs ${Platform.select({ android: 'font-bold' }) ?? 'font-medium'}`,
};

// Utilitários `text-*` que não são cor (tamanho e alinhamento).
const NON_COLOR_TEXT = /^(xs|sm|base|lg|[2-9]?xl|left|center|right|justify|start|end|\[\d)/;

/**
 * Se o `className` já define uma cor de texto, a cor do tema é omitida: no NativeWind
 * a classe que vence um conflito é a que vem depois na folha de estilos, não no
 * `className`, então `text-ink` podia sobrescrever ex. `text-danger`.
 */
function hasTextColor(className?: string) {
  return (className ?? '').split(/\s+/).some((token) => {
    const match = /^(?:[\w-]+:)?text-(.+)$/.exec(token);
    return match !== null && !NON_COLOR_TEXT.test(match[1]);
  });
}

export function ThemedText({ className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  return (
    <Text
      className={[hasTextColor(`${typeClasses[type]} ${className ?? ''}`) ? null : themeColorClasses[themeColor ?? 'text'], typeClasses[type], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}
