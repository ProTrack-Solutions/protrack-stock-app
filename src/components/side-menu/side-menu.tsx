import { Ionicons } from "@expo/vector-icons";
import { router, usePathname, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { Logo } from "@/components/ui/logo";
import { Gradients, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { canAccess, MENU_SECTIONS, type MenuItem } from "./menu-items";

const DURATION = 220;

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

function initials(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (
    (parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth * 0.82, 320);

  // Mantém o menu montado até a animação de saída terminar.
  const [mounted, setMounted] = useState(visible);
  // `Animated` do React Native: o `Animated.View` do Reanimated recebe `cssInterop`
  // do NativeWind (ui/animated.tsx) e perdia os estilos do painel no Android.
  const progress = useRef(new Animated.Value(0)).current;
  // Ação (navegar/sair) executada só depois que o Modal sai da tela: trocar de rota
  // com o Modal aberto quebra o Fabric no Android ("addViewAt ... already has a parent").
  const pendingAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (mounted || !pendingAction.current) return;
    const action = pendingAction.current;
    pendingAction.current = null;
    action();
  }, [mounted]);

  useEffect(() => {
    if (visible) setMounted(true);
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [visible, progress]);

  const backdropStyle = { opacity: progress };
  const panelStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-width, 0],
        }),
      },
    ],
  };

  if (!mounted) return null;

  const closeThen = (action: () => void) => {
    pendingAction.current = action;
    onClose();
  };

  const navigate = (href: Href) => {
    if (href === pathname) return onClose();
    closeThen(() => {
      if (href === "/") router.dismissTo("/");
      else router.navigate(href);
    });
  };

  const confirmSignOut = () => {
    Alert.alert("Sair da conta?", "Você precisará entrar novamente.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => closeThen(signOut),
      },
    ]);
  };

  const roleLabel =
    user?.role === "ADMIN"
      ? "Administrador"
      : user?.department_name || "Colaborador";
  const sections = MENU_SECTIONS.filter((section) =>
    canAccess(user, section.module),
  );

  return (
    // Modal garante que o menu fique acima das telas do Stack (que são views nativas) e do web.
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1" pointerEvents={visible ? "auto" : "none"}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            className="flex-1"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
          />
        </Animated.View>

        <Animated.View style={[styles.panel, { width }, panelStyle]}>
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="gap-four rounded-br-four px-four pb-four"
            style={{ paddingTop: insets.top + Spacing.four }}
          >
            <View className="flex-row items-center justify-between">
              <Logo width={64} />
              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
                className="h-9 w-9 items-center justify-center rounded-two bg-white/[0.18] active:opacity-70"
              >
                <Ionicons name="close" size={20} color="#ffffff" />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-three rounded-three bg-white/[0.16] p-three">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
                <ThemedText className="font-bold text-[#7C4FE0]">
                  {initials(user?.name)}
                </ThemedText>
              </View>
              <View className="flex-1">
                <ThemedText className="font-bold text-white" numberOfLines={1}>
                  {user?.name ?? "Minha conta"}
                </ThemedText>
                <ThemedText
                  type="small"
                  className="text-xs leading-4 text-white/85"
                  numberOfLines={1}
                >
                  {roleLabel}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          <ScrollView contentContainerClassName="gap-four px-three py-four">
            {sections.map((section) => (
              <View key={section.title} className="gap-one">
                <ThemedText
                  type="smallBold"
                  themeColor="textSecondary"
                  className="mb-one px-two text-[11px] tracking-widest"
                >
                  {section.title.toUpperCase()}
                </ThemedText>
                {section.items.map((item) => (
                  <MenuRow
                    key={item.label}
                    item={item}
                    active={pathname === item.href}
                    onPress={() => navigate(item.href)}
                  />
                ))}
              </View>
            ))}
          </ScrollView>

          <View
            className="gap-two border-t-hairline border-line px-three pt-three"
            style={{ paddingBottom: insets.bottom + Spacing.three }}
          >
            <Pressable
              onPress={confirmSignOut}
              accessibilityRole="button"
              className="flex-row items-center gap-three rounded-three p-two active:bg-red-50"
            >
              <View className="h-9 w-9 items-center justify-center rounded-two bg-danger-soft">
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </View>
              <ThemedText className="text-danger" type="smallBold">
                Sair da conta
              </ThemedText>
            </Pressable>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              className="px-two text-[11px]"
            >
              ProTrack Gerencial
            </ThemedText>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function MenuRow({
  item,
  active,
  onPress,
}: {
  item: MenuItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`flex-row items-center gap-three rounded-three p-two ${
        active ? "bg-paper shadow-sm shadow-black/10" : "active:bg-paper/70"
      }`}
    >
      {active ? (
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-9 w-9 items-center justify-center rounded-two"
        >
          <Ionicons name={item.activeIcon} size={18} color="#ffffff" />
        </LinearGradient>
      ) : (
        <View className="h-9 w-9 items-center justify-center rounded-two bg-paper">
          <Ionicons name={item.icon} size={18} color="#60646C" />
        </View>
      )}
      <ThemedText
        type="smallBold"
        className={`flex-1 ${active ? "text-brand" : ""}`}
      >
        {item.label}
      </ThemedText>
      {active && <View className="h-1.5 w-1.5 rounded-full bg-brand" />}
    </Pressable>
  );
}

// Estilos dos `Animated.View` ficam fora do `className`.
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    backgroundColor: "#F0F0F3",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
});
