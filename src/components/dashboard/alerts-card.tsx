import { View } from "react-native";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import type { Announcement } from "@/interfaces/dashboard.interface";
import { OutlineButton } from "./outline-button";

type AlertsCardProps = {
  announcements: Announcement[];
  onSeeAll: () => void;
};

export function AlertsCard({ announcements, onSeeAll }: AlertsCardProps) {
  return (
    <SectionCard title="Alertas" icon="warning-outline" iconColor="#DC2626">
      {announcements.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Não há avisos
        </ThemedText>
      ) : (
        <View className="gap-two">
          {announcements.map((alert, index) => (
            <View key={index} className="flex-row items-center gap-three rounded-two bg-surface p-three">
              <View className={`h-2 w-2 rounded-full ${alert.type === "alta" ? "bg-danger" : "bg-success"}`} />
              <ThemedText type="small" className="flex-1">
                {alert.title}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
      <OutlineButton label="Ver Todos os Alertas" onPress={onSeeAll} />
    </SectionCard>
  );
}
