import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SelectField } from "@/components/customer/select-field";
import { GradientButton } from "@/components/login/gradient-button";
import { Checkbox } from "@/components/product/checkbox";
import {
  FieldError,
  FormInput,
  FormLabel,
} from "@/components/product/form-field";
import { FormSection } from "@/components/product/form-section";
import { PAYMENT_METHODS } from "@/components/sale/payment-method-grid";
import { ThemedText } from "@/components/themed-text";
import { Gradients, Spacing } from "@/constants/theme";
import type {
  BillCategory,
  Vendor,
} from "@/interfaces/bills-payable.interface";
import type { CompanyPaymentMethod } from "@/interfaces/receivable.interface";
import { getApiErrorMessage } from "@/service/api.service";
import {
  CreateBillPayable,
  FindCreatedBill,
  ListActiveVendors,
  ListBillCategories,
  ScheduleBillPayable,
} from "@/service/bills-payable.service";
import { ListActivePaymentMethods } from "@/service/receivable.service";
import { formatIsoDate, isoDateFromToday } from "@/utils/dates";
import { formatCurrency } from "@/utils/format";
import { maskDate } from "@/utils/masks";

import {
  billAmount,
  EMPTY_BILL_FORM,
  toCreateBillRequest,
  validateBillForm,
  type BillForm,
  type BillFormErrors,
} from "./bill-form";

/** Cores para formas de pagamento que não existem nas vendas (ex: boleto). */
const EXTRA_METHOD_COLORS: Record<string, string> = { boleto: "#F59E0B" };

function methodColor(method: CompanyPaymentMethod) {
  return (
    PAYMENT_METHODS.find((m) => m.value === method.type)?.color ??
    EXTRA_METHOD_COLORS[method.name.trim().toLowerCase()] ??
    "#6B7280"
  );
}

const QUICK_DUE_DATES = [
  { label: "Hoje", days: 0 },
  { label: "7 dias", days: 7 },
  { label: "15 dias", days: 15 },
  { label: "30 dias", days: 30 },
];

type Options = {
  vendors: Vendor[];
  categories: BillCategory[];
  methods: CompanyPaymentMethod[];
};

type NewBillSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Chamado depois de cadastrar a conta. */
  onDone: () => void;
};

export function NewBillSheet({ visible, onClose, onDone }: NewBillSheetProps) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<BillForm>(EMPTY_BILL_FORM);
  const [errors, setErrors] = useState<BillFormErrors>({});
  const [options, setOptions] = useState<Options | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reinicia o formulário e recarrega as opções a cada abertura.
  useEffect(() => {
    if (!visible) return;
    setForm(EMPTY_BILL_FORM);
    setErrors({});
    setOptionsError(null);
    let active = true;
    Promise.all([
      ListActiveVendors(),
      ListBillCategories(),
      ListActivePaymentMethods(),
    ])
      .then(([vendors, categories, methods]) => {
        if (active) setOptions({ vendors, categories, methods });
      })
      .catch((e) => {
        if (active)
          setOptionsError(
            getApiErrorMessage(e, "Não foi possível carregar os cadastros."),
          );
      });
    return () => {
      active = false;
    };
  }, [visible]);

  const set = <K extends keyof BillForm>(key: K, value: BillForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    const errorKey = key === "amountText" ? "amount" : key;
    setErrors((e) => ({ ...e, [errorKey]: undefined }));
  };

  const vendor = options?.vendors.find((v) => v.id === form.vendorId);
  const category = options?.categories.find((c) => c.id === form.categoryId);
  const amount = billAmount(form);

  const submit = async () => {
    const validation = validateBillForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload = toCreateBillRequest(form);
    setSubmitting(true);
    try {
      await CreateBillPayable(payload);
    } catch (error) {
      setSubmitting(false);
      Alert.alert(
        "Erro ao cadastrar",
        getApiErrorMessage(error, "Não foi possível cadastrar a conta."),
      );
      return;
    }

    let scheduleFailed = false;
    if (form.schedule) {
      try {
        const created = await FindCreatedBill(payload);
        if (!created) throw new Error("not found");
        await ScheduleBillPayable(created.id, payload.due_date);
      } catch {
        scheduleFailed = true;
      }
    }

    setSubmitting(false);
    onClose();
    onDone();
    Alert.alert(
      "Conta cadastrada",
      scheduleFailed
        ? "A conta foi cadastrada, mas não foi possível agendar o pagamento. Tente agendar pelo ProTrack web."
        : `${payload.description} de ${formatCurrency(payload.amount)} para ${formatIsoDate(payload.due_date)}.`,
    );
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
        <View className="h-one w-10 self-center rounded-half bg-surface-selected mt-three" />
        <View className="flex-row items-center justify-between px-four py-three border-b-hairline border-line">
          <ThemedText className="text-lg font-bold">
            Nova Conta a Pagar
          </ThemedText>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="h-9 w-9 items-center justify-center rounded-two border border-line active:bg-surface"
          >
            <Ionicons name="close" size={20} color="#60646C" />
          </Pressable>
        </View>

        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-two pb-four"
        >
          {optionsError && (
            <View className="mx-four mt-three rounded-two bg-rose-50 p-three">
              <FieldError message={optionsError} />
            </View>
          )}

          <FormSection
            title="Informações básicas"
            subtitle="Dados do fornecedor e da conta"
            icon="information-circle-outline"
            gradient={["#3B82F6", "#4F46E5"]}
          >
            <View className="gap-two">
              <FormLabel label="Fornecedor" icon="business-outline" required />
              <LoadingSelect
                loading={!options && !optionsError}
                title="Fornecedor"
                placeholder="Selecione o fornecedor"
                options={(options?.vendors ?? []).map((v) => ({
                  value: v.id,
                  label: v.name,
                }))}
                value={form.vendorId}
                onChange={(v) => set("vendorId", v)}
              />
              <FieldError message={errors.vendorId} />
            </View>

            <View className="gap-two">
              <FormLabel label="Categoria" icon="pricetag-outline" required />
              <LoadingSelect
                loading={!options && !optionsError}
                title="Categoria"
                placeholder="Selecione a categoria"
                options={(options?.categories ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                value={form.categoryId}
                onChange={(v) => set("categoryId", v)}
              />
              <FieldError message={errors.categoryId} />
            </View>

            <View className="gap-two">
              <FormLabel
                label="Descrição"
                icon="document-text-outline"
                required
              />
              <FormInput
                placeholder="Ex: Conta de energia elétrica"
                value={form.description}
                onChangeText={(t) => set("description", t)}
                maxLength={255}
                error={errors.description}
              />
              <FieldError message={errors.description} />
            </View>
          </FormSection>

          <FormSection
            title="Prazos"
            subtitle="Vencimento e agendamento do pagamento"
            icon="calendar-outline"
            gradient={["#6366F1", "#9333EA"]}
          >
            <View className="gap-two">
              <FormLabel label="Data de vencimento" required />
              <FormInput
                placeholder="dd/mm/aaaa"
                value={form.dueDate}
                onChangeText={(t) => set("dueDate", maskDate(t))}
                keyboardType="number-pad"
                maxLength={10}
                error={errors.dueDate}
                suffix={
                  <Ionicons name="calendar-outline" size={18} color="#60646C" />
                }
              />
              <FieldError message={errors.dueDate} />
              <View className="flex-row flex-wrap gap-two">
                {QUICK_DUE_DATES.map((quick) => {
                  const value = formatIsoDate(isoDateFromToday(quick.days));
                  const selected = form.dueDate === value;
                  return (
                    <Pressable
                      key={quick.label}
                      onPress={() => set("dueDate", value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      className={`rounded-full border px-three py-two active:opacity-70 ${
                        selected
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-paper"
                      }`}
                    >
                      <ThemedText
                        type="smallBold"
                        className={`text-xs ${selected ? "text-brand" : ""}`}
                      >
                        {quick.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Checkbox
              label="Agendar pagamento para o vencimento"
              checked={form.schedule}
              onChange={(checked) => set("schedule", checked)}
            />
          </FormSection>

          <FormSection
            title="Pagamento"
            subtitle="Valores e forma de pagamento"
            icon="logo-usd"
            gradient={["#10B981", "#0D9488"]}
          >
            <View className="gap-two">
              <FormLabel label="Valor total" required />
              <FormInput
                prefix="R$"
                placeholder="0,00"
                value={form.amountText}
                onChangeText={(t) =>
                  set("amountText", t.replace(/[^0-9.,]/g, ""))
                }
                keyboardType="decimal-pad"
                error={errors.amount}
              />
              <FieldError message={errors.amount} />
            </View>

            <View className="gap-two">
              <FormLabel
                label="Forma de pagamento"
                icon="card-outline"
                required
              />
              {!options && !optionsError ? (
                <ActivityIndicator />
              ) : options && options.methods.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Nenhuma forma de pagamento ativa. Cadastre uma no ProTrack
                  web.
                </ThemedText>
              ) : (
                <View className="flex-row flex-wrap gap-two">
                  {options?.methods.map((method) => {
                    const selected = method.id === form.paymentMethodId;
                    return (
                      <Pressable
                        key={method.id}
                        onPress={() => set("paymentMethodId", method.id)}
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
                          style={{ backgroundColor: methodColor(method) }}
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
              <FieldError message={errors.paymentMethodId} />
            </View>

            <View className="gap-two">
              <FormLabel label="Observações" />
              <FormInput
                placeholder="Adicione observações sobre esta conta (opcional)"
                value={form.notes}
                onChangeText={(t) => set("notes", t)}
                multiline
                maxLength={500}
              />
            </View>

            <View className="gap-three rounded-three border border-line bg-surface p-three">
              <View className="flex-row items-center gap-two">
                <Ionicons name="pricetag-outline" size={16} color="#000000" />
                <ThemedText type="smallBold">Resumo rápido</ThemedText>
              </View>
              <View className="flex-row flex-wrap items-center gap-two">
                <ThemedText type="small" themeColor="textSecondary">
                  Fornecedor:
                </ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {vendor?.name ?? "—"}
                </ThemedText>
                {category && (
                  <View className="rounded-full border border-blue-200 bg-blue-50 px-two py-half">
                    <ThemedText
                      type="smallBold"
                      className="text-xs text-blue-700"
                    >
                      {category.name}
                    </ThemedText>
                  </View>
                )}
              </View>
              <View className="flex-row gap-two">
                <SummaryTile label="VALOR" value={formatCurrency(amount)} />
                <SummaryTile label="VENCE" value={form.dueDate || "—"} />
              </View>
            </View>
          </FormSection>
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
            label={submitting ? "Cadastrando..." : "Cadastrar conta"}
            icon="save-outline"
            colors={Gradients.primary}
            disabled={submitting || !options}
            onPress={submit}
            className={`flex-1 ${submitting || !options ? "opacity-60" : ""}`}
          />
        </View>
      </View>
    </Modal>
  );
}

function LoadingSelect({
  loading,
  ...props
}: { loading: boolean } & Parameters<typeof SelectField<string>>[0]) {
  if (loading) {
    return (
      <View className="items-start rounded-two border border-line bg-field px-three py-three">
        <ActivityIndicator size="small" />
      </View>
    );
  }
  return <SelectField {...props} />;
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-half rounded-two border border-line bg-paper p-three">
      <ThemedText
        type="smallBold"
        themeColor="textSecondary"
        className="text-[10px] tracking-wider"
      >
        {label}
      </ThemedText>
      <ThemedText className="font-bold" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </ThemedText>
    </View>
  );
}
