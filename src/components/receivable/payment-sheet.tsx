import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/login/gradient-button";
import {
  FieldError,
  FormInput,
  FormLabel,
} from "@/components/product/form-field";
import { ClientSelect } from "@/components/sale/client-select";
import { parseNumber } from "@/components/sale/number-field";
import { PAYMENT_METHODS } from "@/components/sale/payment-method-grid";
import { ThemedText } from "@/components/themed-text";
import { Skeleton } from "@/components/ui/skeleton";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { Gradients, Spacing } from "@/constants/theme";
import type { CompanyPaymentMethod } from "@/interfaces/receivable.interface";
import type { Customer } from "@/interfaces/sale.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { GetCustomer } from "@/service/customer.service";
import {
  CreatePayment,
  ListActivePaymentMethods,
} from "@/service/receivable.service";
import { formatCurrency } from "@/utils/format";

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Cliente já escolhido (ex: botão "Baixar" de uma parcela) e valor sugerido. */
export type PaymentPreset = {
  customerId: string;
  customerName: string;
  amount: number;
};

type PaymentSheetProps = {
  visible: boolean;
  preset: PaymentPreset | null;
  onClose: () => void;
  /** Chamado depois de registrar o recebimento. */
  onDone: () => void;
};

type Errors = Partial<Record<"customer" | "amount" | "method", string>>;

export function PaymentSheet({
  visible,
  preset,
  onClose,
  onDone,
}: PaymentSheetProps) {
  const insets = useSafeAreaInsets();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [amountText, setAmountText] = useState("");
  const [methodId, setMethodId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [methods, setMethods] = useState<CompanyPaymentMethod[] | null>(null);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reinicia o formulário a cada abertura.
  useEffect(() => {
    if (!visible) return;
    setCustomer(null);
    setBalance(null);
    setAmountText(preset ? preset.amount.toFixed(2).replace(".", ",") : "");
    setMethodId(null);
    setNotes("");
    setErrors({});
    setMethodsError(null);
    ListActivePaymentMethods()
      .then(setMethods)
      .catch((e) =>
        setMethodsError(
          getApiErrorMessage(
            e,
            "Não foi possível carregar as formas de pagamento.",
          ),
        ),
      );

    if (!preset) return;
    let active = true;
    // O saldo devedor (limite da baixa) vem do cadastro do cliente.
    GetCustomer(preset.customerId)
      .then((c) => {
        if (!active) return;
        setCustomer({
          id: c.id,
          full_name: c.full_name,
          cpf: c.cpf,
          email: c.email,
          mobile_phone: c.mobile_phone,
          balance_due: c.balance_due,
        });
        setBalance(c.balance_due ?? 0);
      })
      .catch(() => {
        if (active) setBalance(null);
      });
    return () => {
      active = false;
    };
  }, [visible, preset]);

  const amount = round2(parseNumber(amountText));
  const customerName = customer?.full_name ?? preset?.customerName;
  const remaining = balance !== null ? round2(balance - amount) : null;

  const validate = (): Errors => {
    const next: Errors = {};
    if (!customer) next.customer = "Selecione o cliente.";
    if (amount <= 0) next.amount = "Informe um valor maior que zero.";
    else if (balance !== null && amount > balance)
      next.amount = `O valor passa do saldo devedor (${formatCurrency(balance)}).`;
    if (!methodId) next.method = "Selecione a forma de pagamento.";
    return next;
  };

  const submit = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0 || !customer || !methodId) return;

    setSubmitting(true);
    try {
      await CreatePayment({
        customer_id: customer.id,
        payment_method_id: methodId,
        amount_paid: amount,
        notes: notes.trim(),
      });
      onClose();
      onDone();
      Alert.alert(
        "Baixa registrada",
        `Recebimento de ${formatCurrency(amount)} de ${customer.full_name} confirmado.`,
      );
    } catch (error) {
      Alert.alert(
        "Erro ao dar baixa",
        getApiErrorMessage(error, "Não foi possível registrar o recebimento."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
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
      <View className="max-h-[92%] overflow-hidden rounded-t-four bg-paper">
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center gap-three px-four py-four"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="cash-outline" size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <ThemedText className="text-lg font-bold text-white">
              Dar baixa em recebimento
            </ThemedText>
            <ThemedText type="small" className="text-xs text-white/85">
              Informe o cliente e o valor recebido.
            </ThemedText>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="h-9 w-9 items-center justify-center rounded-two bg-white/20 active:opacity-70"
          >
            <Ionicons name="close" size={20} color="#ffffff" />
          </Pressable>
        </LinearGradient>

        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-four p-four"
        >
          <View className="gap-two">
            <FormLabel label="Cliente" icon="person-outline" required />
            {preset ? (
              <View className="rounded-two border border-line bg-field p-three">
                <ThemedText className="font-bold">{customerName}</ThemedText>
              </View>
            ) : (
              <ClientSelect
                value={customer}
                onChange={(c) => {
                  setCustomer(c);
                  setBalance(c ? (c.balance_due ?? 0) : null);
                  setErrors((e) => ({ ...e, customer: undefined }));
                }}
                error={errors.customer}
              />
            )}
            <FieldError message={errors.customer} />
            {customer && (
              <View className="flex-row items-center justify-between rounded-two bg-brand-soft px-three py-two">
                <ThemedText type="small" className="text-brand">
                  Saldo devedor
                </ThemedText>
                {balance === null ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <ThemedText type="smallBold" className="text-brand">
                    {formatCurrency(balance)}
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          <View className="gap-two">
            <FormLabel label="Valor recebido" required />
            <FormInput
              prefix="R$"
              placeholder="0,00"
              value={amountText}
              onChangeText={(t) => {
                setAmountText(t.replace(/[^0-9.,]/g, ""));
                setErrors((e) => ({ ...e, amount: undefined }));
              }}
              keyboardType="decimal-pad"
              error={errors.amount}
            />
            <FieldError message={errors.amount} />
            {remaining !== null && amount > 0 && remaining >= 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                {remaining === 0
                  ? "Quita todo o saldo do cliente."
                  : `Saldo após a baixa: ${formatCurrency(remaining)}`}
              </ThemedText>
            )}
            <ThemedText
              type="small"
              themeColor="textSecondary"
              className="text-xs"
            >
              O valor é abatido das parcelas em aberto do cliente, da mais
              antiga para a mais nova.
            </ThemedText>
          </View>

          <View className="gap-two">
            <FormLabel label="Forma de pagamento" required />
            {methods === null && !methodsError ? (
              <ActivityIndicator />
            ) : methodsError ? (
              <FieldError message={methodsError} />
            ) : methods && methods.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Nenhuma forma de pagamento ativa. Cadastre uma no ProTrack web.
              </ThemedText>
            ) : (
              <View className="flex-row flex-wrap gap-two">
                {methods?.map((method) => {
                  const selected = method.id === methodId;
                  const color =
                    PAYMENT_METHODS.find((m) => m.value === method.type)
                      ?.color ?? "#6B7280";
                  return (
                    <Pressable
                      key={method.id}
                      onPress={() => {
                        setMethodId(method.id);
                        setErrors((e) => ({ ...e, method: undefined }));
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`grow basis-[45%] flex-row items-center gap-two rounded-two border px-three py-three active:opacity-70 ${
                        selected
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-paper"
                      }`}
                    >
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <ThemedText
                        type="smallBold"
                        className={`flex-1 ${selected ? "text-brand" : ""}`}
                        numberOfLines={1}
                      >
                        {method.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <FieldError message={errors.method} />
          </View>

          <View className="gap-two">
            <FormLabel label="Observação" icon="chatbubble-outline" />
            <FormInput
              placeholder="Adicione uma observação (opcional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={300}
            />
          </View>
        </KeyboardAwareScrollView>

        <View
          className="flex-row gap-three border-t-hairline border-line px-four pt-three"
          style={{ paddingBottom: insets.bottom + Spacing.three }}
        >
          <Pressable
            onPress={onClose}
            className="items-center justify-center rounded-two border border-line bg-paper px-four active:bg-surface"
            accessibilityRole="button"
          >
            <ThemedText type="smallBold">Cancelar</ThemedText>
          </Pressable>
          <GradientButton
            label={submitting ? "Registrando..." : "Confirmar baixa"}
            icon="checkmark-circle-outline"
            colors={Gradients.primary}
            disabled={submitting}
            onPress={submit}
            className={`flex-1 ${submitting ? "opacity-60" : ""}`}
          />
        </View>
      </View>
    </Modal>
  );
}
