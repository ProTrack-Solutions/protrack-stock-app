import { Ionicons } from "@expo/vector-icons";
import { isCancel } from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { canAccess } from "@/components/side-menu/menu-items";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { Gradients, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { isInactive } from "@/hooks/use-customers";
import type { Customer } from "@/interfaces/customer.interface";
import type { NewSaleParams } from "@/interfaces/sale.interface";
import { getApiErrorMessage } from "@/service/api.service";
import {
  CountCustomerSales,
  DeactivateCustomer,
} from "@/service/customer.service";
import { formatCurrency } from "@/utils/format";
import { maskCpf, maskPhone } from "@/utils/masks";

import { avatarColor, formatAddress, initials } from "./customer-row";

type CustomerDetailSheetProps = {
  customer: Customer | null;
  onClose: () => void;
  /** Chamado depois de desativar, para a lista recarregar. */
  onChanged: () => void;
};

const digitsOf = (value: string) => value.replace(/\D/g, "");

/** "1974-12-21" -> "21/12/1974 · 51 anos" */
function formatBirth(birthDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);
  if (!match) return "";
  const [, y, m, d] = match.map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
  )
    age -= 1;
  return `${match[3]}/${match[2]}/${match[1]} · ${age} ${age === 1 ? "ano" : "anos"}`;
}

/** ISO -> "09/10/2026" */
function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1900) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

const formatPhone = (value: string) => (value ? maskPhone(value) : "");

export function CustomerDetailSheet({
  customer,
  onClose,
  onChanged,
}: CustomerDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [sales, setSales] = useState<{ count: number; capped: boolean } | null>(
    null,
  );
  const [salesError, setSalesError] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const canSell = canAccess(user, "sales");

  useEffect(() => {
    setSales(null);
    setSalesError(false);
    if (!customer || !canSell) return;
    const controller = new AbortController();
    CountCustomerSales(customer, controller.signal)
      .then(setSales)
      .catch((e) => {
        if (!isCancel(e)) setSalesError(true);
      });
    return () => controller.abort();
  }, [customer, canSell]);

  if (!customer) return null;

  const inactive = isInactive(customer);
  const color = avatarColor(customer.full_name);
  const phone =
    customer.mobile_phone || customer.whatsapp || customer.home_phone;
  const since = formatDate(customer.created_at);

  const open = (url: string) =>
    Linking.openURL(url).catch(() =>
      Alert.alert(
        "Não foi possível abrir",
        "Nenhum aplicativo disponível para esta ação.",
      ),
    );

  const navigate = (action: () => void) => {
    onClose();
    // Espera o Modal fechar antes de trocar de tela (Android/Fabric).
    setTimeout(action, 300);
  };

  const confirmDeactivate = () => {
    Alert.alert(
      "Desativar cliente?",
      `${customer.full_name} não aparecerá mais nas vendas. A reativação não está disponível no app.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            setDeactivating(true);
            try {
              await DeactivateCustomer(customer.id);
              onClose();
              onChanged();
            } catch (error) {
              Alert.alert(
                "Erro ao desativar",
                getApiErrorMessage(
                  error,
                  "Não foi possível desativar o cliente.",
                ),
              );
            } finally {
              setDeactivating(false);
            }
          },
        },
      ],
    );
  };

  const saleParams: NewSaleParams = {
    customerId: customer.id,
    customerName: customer.full_name,
    customerCpf: customer.cpf,
    customerEmail: customer.email,
    customerPhone: customer.mobile_phone,
    customerBalance: String(customer.balance_due ?? 0),
  };

  const salesLabel = !canSell
    ? null
    : salesError
      ? "—"
      : sales === null
        ? undefined
        : `${sales.count}${sales.capped ? "+" : ""} ${sales.count === 1 && !sales.capped ? "venda" : "vendas"}`;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40"
        onPress={onClose}
        accessibilityLabel="Fechar"
      />
      <View
        className="max-h-[88%] rounded-t-four bg-paper px-four pt-three"
        style={{ paddingBottom: insets.bottom + Spacing.three }}
      >
        <View className="mb-three h-one w-10 self-center rounded-half bg-surface-selected" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-three"
        >
          <View className="flex-row items-center gap-three">
            <View
              className={`h-14 w-14 items-center justify-center rounded-full ${color.bg}`}
            >
              <ThemedText className={`text-lg font-bold ${color.text}`}>
                {initials(customer.full_name)}
              </ThemedText>
            </View>
            <View className="flex-1">
              <ThemedText className="text-lg font-bold" numberOfLines={2}>
                {customer.full_name}
              </ThemedText>
              {since ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Cliente desde {since}
                </ThemedText>
              ) : null}
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

          <View className="flex-row gap-two">
            <ContactButton
              label="WhatsApp"
              icon="logo-whatsapp"
              className="bg-emerald-50"
              textClass="text-emerald-700"
              iconColor="#047857"
              disabled={!customer.whatsapp}
              onPress={() =>
                open(`https://wa.me/55${digitsOf(customer.whatsapp)}`)
              }
            />
            <ContactButton
              label="Ligar"
              icon="call-outline"
              className="bg-blue-50"
              textClass="text-blue-700"
              iconColor="#1D4ED8"
              disabled={!phone}
              onPress={() => open(`tel:${digitsOf(phone)}`)}
            />
            <ContactButton
              label="Email"
              icon="mail-outline"
              className="bg-violet-50"
              textClass="text-violet-700"
              iconColor="#6D28D9"
              disabled={!customer.email}
              onPress={() => open(`mailto:${customer.email}`)}
            />
          </View>

          <View className="rounded-three border border-line">
            <InfoRow
              label="CPF"
              value={
                digitsOf(customer.cpf).length === 11
                  ? maskCpf(customer.cpf)
                  : customer.cpf
              }
              mono
            />
            <InfoRow
              label="Nascimento"
              value={formatBirth(customer.birth_date)}
            />
            <InfoRow label="Telefone" value={formatPhone(phone)} />
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Endereço" value={formatAddress(customer)} />
            <InfoRow
              label="Saldo devedor"
              value={formatCurrency(customer.balance_due ?? 0)}
              valueClass={
                (customer.balance_due ?? 0) > 0
                  ? "text-danger"
                  : "text-emerald-700"
              }
              last={salesLabel === null}
            />
            {salesLabel !== null && (
              <InfoRow
                label="Compras"
                value={salesLabel}
                loading={salesLabel === undefined}
                last
              />
            )}
          </View>

          {inactive ? (
            <View className="flex-row items-center gap-two rounded-three bg-surface p-three">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#60646C"
              />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                className="flex-1"
              >
                Cliente inativo. Ele não pode ser editado nem usado em novas
                vendas.
              </ThemedText>
            </View>
          ) : (
            <>
              <View className="flex-row gap-three">
                <Pressable
                  onPress={confirmDeactivate}
                  disabled={deactivating}
                  accessibilityRole="button"
                  className="flex-1 items-center justify-center rounded-three border border-rose-200 bg-rose-50 py-three active:opacity-70"
                >
                  {deactivating ? (
                    <ActivityIndicator color="#DC2626" />
                  ) : (
                    <ThemedText type="smallBold" className="text-danger">
                      Desativar
                    </ThemedText>
                  )}
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigate(() =>
                      router.push({
                        pathname: "/editar-cliente",
                        params: { id: customer.id },
                      }),
                    )
                  }
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center gap-two rounded-three border border-line bg-paper py-three active:bg-surface"
                >
                  <Ionicons name="create-outline" size={18} color="#000000" />
                  <ThemedText type="smallBold">Editar</ThemedText>
                </Pressable>
              </View>

              {canSell && (
                <Pressable
                  onPress={() =>
                    navigate(() =>
                      router.push({
                        pathname: "/nova-venda",
                        params: saleParams,
                      }),
                    )
                  }
                  accessibilityRole="button"
                  className="active:opacity-85"
                >
                  <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-row items-center justify-center gap-two rounded-three py-four"
                  >
                    <Ionicons name="cart-outline" size={20} color="#ffffff" />
                    <ThemedText type="smallBold" className="text-white">
                      Nova venda para este cliente
                    </ThemedText>
                  </LinearGradient>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function ContactButton({
  label,
  icon,
  className,
  textClass,
  iconColor,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  className: string;
  textClass: string;
  iconColor: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-1 items-center gap-one rounded-three py-three active:opacity-70 ${className} ${disabled ? "opacity-40" : ""}`}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <ThemedText type="smallBold" className={textClass}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  valueClass,
  mono,
  loading,
  last,
}: {
  label: string;
  value?: string;
  valueClass?: string;
  mono?: boolean;
  loading?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start gap-three px-three py-three ${last ? "" : "border-b-hairline border-line"}`}
    >
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View className="flex-1 items-end">
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <ThemedText
            type={mono ? "code" : "smallBold"}
            className={["text-right", mono ? "text-sm" : "", valueClass]
              .filter(Boolean)
              .join(" ")}
          >
            {value?.trim() || "—"}
          </ThemedText>
        )}
      </View>
    </View>
  );
}
