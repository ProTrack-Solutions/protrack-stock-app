import type { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";

import type { User } from "@/interfaces/auth.interface";

export type MenuItem = {
  label: string;
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  /** Ícone quando a rota está ativa. */
  activeIcon: keyof typeof Ionicons.glyphMap;
};

export type MenuSection = {
  title: string;
  /** Módulo exigido pela API (`RequireModule`); sem ele, a seção aparece para todos. */
  module?: string;
  items: MenuItem[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Principal",
    items: [{ label: "Dashboard", href: "/", icon: "home-outline", activeIcon: "home" }],
  },
  {
    title: "Vendas",
    module: "sales",
    items: [{ label: "Nova Venda", href: "/nova-venda", icon: "cart-outline", activeIcon: "cart" }],
  },
  {
    title: "Clientes",
    module: "customers",
    items: [
      { label: "Clientes", href: "/clientes", icon: "people-outline", activeIcon: "people" },
      { label: "Novo Cliente", href: "/novo-cliente", icon: "person-add-outline", activeIcon: "person-add" },
    ],
  },
  {
    title: "Estoque",
    module: "inventory",
    items: [
      { label: "Estoque", href: "/estoque", icon: "cube-outline", activeIcon: "cube" },
      { label: "Novo Produto", href: "/novo-produto", icon: "add-circle-outline", activeIcon: "add-circle" },
    ],
  },
];

/** ADMIN acessa todos os módulos; os demais, só os liberados para o departamento. */
export function canAccess(user: User | null, module?: string) {
  if (!module) return true;
  if (!user) return false;
  return user.role === "ADMIN" || (user.modules ?? []).includes(module);
}
