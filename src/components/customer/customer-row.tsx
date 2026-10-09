import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { isInactive } from "@/hooks/use-customers";
import type { Customer } from "@/interfaces/customer.interface";
import { maskCpf } from "@/utils/masks";

// Cores do avatar, escolhidas pelo nome para o mesmo cliente manter a cor.
const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (
    (parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

export function avatarColor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** "Rua X, 32 · Cidade, UF" */
export function formatAddress(c: Customer) {
  const street = [c.address_street, c.address_number]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(", ");
  const city = [c.address_city, c.address_state]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(", ");
  return [street, city].filter(Boolean).join(" · ");
}

export function CustomerRow({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) {
  const inactive = isInactive(customer);
  const color = avatarColor(customer.full_name);
  const address = formatAddress(customer);
  const cpf =
    customer.cpf.replace(/\D/g, "").length === 11
      ? maskCpf(customer.cpf)
      : customer.cpf;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${customer.full_name}`}
      className={`gap-three rounded-three bg-paper p-three border border-line active:bg-surface ${inactive ? "opacity-70" : ""}`}
    >
      <View className="flex-row items-center gap-three">
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${color.bg}`}
        >
          <ThemedText type="smallBold" className={color.text}>
            {initials(customer.full_name)}
          </ThemedText>
        </View>
        <View className="flex-1">
          <ThemedText className="font-bold" numberOfLines={1}>
            {customer.full_name}
          </ThemedText>
          <ThemedText type="code" themeColor="textSecondary">
            {cpf}
          </ThemedText>
        </View>
        <View
          className={`self-start rounded-full px-two py-half ${inactive ? "bg-slate-100" : "bg-emerald-100"}`}
        >
          <ThemedText
            type="smallBold"
            className={`text-xs ${inactive ? "text-slate-600" : "text-emerald-700"}`}
          >
            {inactive ? "Inativo" : "Ativo"}
          </ThemedText>
        </View>
      </View>

      <View className="gap-one border-t-hairline border-line pt-three">
        <InfoLine icon="mail-outline" text={customer.email} />
        {address ? <InfoLine icon="location-outline" text={address} /> : null}
      </View>
    </Pressable>
  );
}

function InfoLine({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-two">
      <Ionicons name={icon} size={14} color="#60646C" />
      <ThemedText
        type="small"
        themeColor="textSecondary"
        className="flex-1"
        numberOfLines={1}
      >
        {text || "—"}
      </ThemedText>
    </View>
  );
}
