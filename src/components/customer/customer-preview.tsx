import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type CustomerPreviewProps = {
  name: string;
  cpf: string;
  genderLabel: string;
  email: string;
  address: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return (
    (parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

export function CustomerPreview({
  name,
  cpf,
  genderLabel,
  email,
  address,
}: CustomerPreviewProps) {
  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-center gap-three">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-soft">
          <ThemedText className="font-bold text-brand">
            {initials(name)}
          </ThemedText>
        </View>
        <View className="flex-1">
          <ThemedText
            type="smallBold"
            themeColor="textSecondary"
            className="text-[11px] tracking-widest"
          >
            RESUMO · PRÉ-VISUALIZAÇÃO
          </ThemedText>
          <ThemedText className="font-bold" numberOfLines={1}>
            {name.trim() || "—"}
          </ThemedText>
        </View>
      </View>
      <View className="flex-row gap-two">
        <PreviewItem label="CPF" value={cpf} className="flex-1" />
        <PreviewItem label="GÊNERO" value={genderLabel} className="flex-1" />
      </View>
      <PreviewItem label="EMAIL" value={email} />
      <PreviewItem label="ENDEREÇO" value={address} />
    </View>
  );
}

function PreviewItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <View
      className={`gap-half rounded-two p-three border border-line ${className}`}
    >
      <ThemedText
        type="smallBold"
        themeColor="textSecondary"
        className="text-[11px] tracking-widest"
      >
        {label}
      </ThemedText>
      <ThemedText className="font-bold" numberOfLines={2}>
        {value.trim() || "—"}
      </ThemedText>
    </View>
  );
}
