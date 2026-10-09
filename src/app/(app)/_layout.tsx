import { Stack } from "expo-router";

import { SideMenuProvider } from "@/contexts/side-menu-context";

export default function AppLayout() {
  return (
    <SideMenuProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SideMenuProvider>
  );
}
