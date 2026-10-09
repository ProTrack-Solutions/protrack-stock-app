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

// Utilitários `text-*` de tamanho e de alinhamento (o resto é cor).
const TEXT_SIZE = /^(xs|sm|base|lg|[2-9]?xl|\[\d)/;
const TEXT_ALIGN = /^(left|center|right|justify|start|end)$/;

type TextClassKind = 'color' | 'size' | 'leading' | null;

function classKind(token: string): TextClassKind {
  const utility = token.replace(/^[\w-]+:/, '');
  if (utility.startsWith('leading-')) return 'leading';
  if (!utility.startsWith('text-')) return null;
  const value = utility.slice('text-'.length);
  if (TEXT_SIZE.test(value)) return 'size';
  return TEXT_ALIGN.test(value) ? null : 'color';
}

/**
 * No NativeWind, num conflito vence a classe que vem depois na folha de estilos,
 * não no `className`. Por isso a cor do tema e o tamanho/entrelinha do `type`
 * são omitidos quando o `className` já os define (ex. `text-danger`, `text-[26px]`).
 */
function mergeClasses(themeClass: string, typeClass: string, className = '') {
  const kinds = new Set(className.split(/\s+/).map(classKind));
  const typeTokens = typeClass.split(' ').filter((token) => {
    const kind = classKind(token);
    return !(kind === 'size' || kind === 'leading') || !kinds.has(kind);
  });
  const hasColor = kinds.has('color') || typeTokens.some((token) => classKind(token) === 'color');
  return [hasColor ? null : themeClass, ...typeTokens, className].filter(Boolean).join(' ');
}

export function ThemedText({ className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  return (
    <Text
      className={mergeClasses(themeColorClasses[themeColor ?? 'text'], typeClasses[type], className)}
      {...rest}
    />
  );
}
