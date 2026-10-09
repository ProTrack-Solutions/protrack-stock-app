import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ClientSelect } from "@/components/sale/client-select";
import { NumberField, parseNumber } from "@/components/sale/number-field";
import { paymentMethodLabel, PaymentMethodGrid } from "@/components/sale/payment-method-grid";
import { ProductPicker } from "@/components/sale/product-picker";
import { SaleFooter } from "@/components/sale/sale-footer";
import { SaleHeader } from "@/components/sale/sale-header";
import { SaleItemRow } from "@/components/sale/sale-item-row";
import { SaleSummary } from "@/components/sale/sale-summary";
import { FieldLabel, SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import {
  CreateSaleRequest,
  Customer,
  NewSaleParams,
  PaymentMethod,
  Product,
  SaleItem,
} from "@/interfaces/sale.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { CreateSale } from "@/service/sale.service";
import { formatLongDate } from "@/utils/format";

const round2 = (value: number) => Math.round(value * 100) / 100;

type FormErrors = Partial<Record<"customer" | "installments" | "dueDay" | "downPayment", string>>;

function customerFromParams(params: NewSaleParams): Customer | null {
  if (!params.customerId || !params.customerName) return null;
  return {
    id: params.customerId,
    full_name: params.customerName,
    cpf: params.customerCpf ?? "",
    email: params.customerEmail ?? "",
    mobile_phone: params.customerPhone ?? "",
    balance_due: Number(params.customerBalance) || 0,
  };
}

export default function NewSaleScreen() {
  const [date] = useState(() => new Date());
  const params = useLocalSearchParams<NewSaleParams>();
  const [customer, setCustomer] = useState<Customer | null>(() => customerFromParams(params));
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discountText, setDiscountText] = useState("0");
  const [downPaymentText, setDownPaymentText] = useState("0");
  const [installmentsText, setInstallmentsText] = useState("1");
  const [dueDayText, setDueDayText] = useState(() => String(date.getDate()));
  const [errors, setErrors] = useState<FormErrors>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isInstallments = paymentMethod === "installments";
  const discountPercent = Math.min(Math.max(parseNumber(discountText), 0), 100);
  const productCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = round2(items.reduce((sum, i) => sum + i.product.sale_price * i.quantity, 0));
  const discount = round2((subtotal * discountPercent) / 100);
  const total = round2(subtotal - discount);

  const downPayment = round2(parseNumber(downPaymentText));
  const installmentsCount = Math.trunc(parseNumber(installmentsText));
  const dueDay = Math.trunc(parseNumber(dueDayText));
  const installmentValue =
    installmentsCount > 0 ? round2((total - downPayment) / installmentsCount) : 0;

  const addProduct = (product: Product) => {
    setItems((current) => {
      const existing = current.find((i) => i.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      return current.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + 1, product.quantity) }
          : i,
      );
    });
  };

  const changeQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((i) => i.product.id !== productId));
  };

  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/" as Href);
  };

  const handleCancel = () => {
    if (items.length === 0 && !customer) return leave();
    Alert.alert("Descartar venda?", "Os dados preenchidos serão perdidos.", [
      { text: "Continuar editando", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: leave },
    ]);
  };

  const validate = (): FormErrors => {
    if (!isInstallments) return {};
    const next: FormErrors = {};
    if (!customer) next.customer = "Selecione um cliente para vendas no crediário.";
    if (installmentsCount < 1) next.installments = "Informe ao menos 1 parcela.";
    if (dueDay < 1 || dueDay > 31) next.dueDay = "Informe um dia entre 1 e 31.";
    if (downPayment >= total) next.downPayment = "A entrada deve ser menor que o total.";
    return next;
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert("Nenhum produto", "Adicione pelo menos um produto à venda.");
      return;
    }

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload: CreateSaleRequest = {
      discount_amount: discount,
      payment_method: paymentMethod,
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      ...(customer && { customer_id: customer.id }),
      ...(isInstallments && {
        installments_count: installmentsCount,
        due_days: dueDay,
        prohibited: downPayment,
      }),
    };

    setSubmitting(true);
    try {
      await CreateSale(payload);
      Alert.alert("Venda cadastrada", "A venda foi registrada com sucesso.", [
        { text: "OK", onPress: leave },
      ]);
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        getApiErrorMessage(error, "Não foi possível cadastrar a venda. Tente novamente."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <SaleHeader date={date} onBack={handleCancel} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-content gap-three self-center p-three">
          <SectionCard title="Informações da Venda" icon="person-outline">
            <View className="gap-two">
              <FieldLabel>Cliente{isInstallments ? " *" : ""}</FieldLabel>
              <ClientSelect
                value={customer}
                onChange={(c) => {
                  setCustomer(c);
                  setErrors((e) => ({ ...e, customer: undefined }));
                }}
                error={errors.customer}
              />
            </View>
            <View className="gap-two">
              <FieldLabel>Data da venda</FieldLabel>
              <View
                className="flex-row items-center gap-two rounded-two bg-surface px-three py-three"
                style={{ borderWidth: 1, borderColor: "#E0E1E6" }}
              >
                <Ionicons name="calendar-outline" size={18} color="#60646C" />
                <ThemedText themeColor="textSecondary">{formatLongDate(date)}</ThemedText>
              </View>
            </View>
          </SectionCard>

          <SectionCard
            title="Produtos da Venda"
            icon="cart-outline"
            right={
              <View className="min-w-7 items-center rounded-full bg-surface px-two py-half">
                <ThemedText type="smallBold" className="text-xs">
                  {items.length}
                </ThemedText>
              </View>
            }
          >
            {items.length === 0 ? (
              <View
                className="items-center gap-one rounded-two px-three py-five"
                style={{ borderWidth: 1, borderStyle: "dashed", borderColor: "#C9CCD3" }}
              >
                <Ionicons name="cube-outline" size={22} color="#60646C" />
                <ThemedText type="smallBold" className="mt-one">
                  Nenhum produto na venda
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" className="text-xs">
                  Busque pelo nome ou código de barras.
                </ThemedText>
              </View>
            ) : (
              <View className="gap-two">
                {items.map((item) => (
                  <SaleItemRow
                    key={item.product.id}
                    item={item}
                    onChangeQuantity={(q) => changeQuantity(item.product.id, q)}
                    onRemove={() => removeItem(item.product.id)}
                  />
                ))}
              </View>
            )}

            <Pressable
              onPress={() => setPickerOpen(true)}
              className="flex-row items-center justify-center gap-two rounded-two bg-[#EEF5FF] py-three active:opacity-70"
              style={{ borderWidth: 1, borderColor: "#BFD8FB" }}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={18} color="#1D4E9E" />
              <ThemedText type="smallBold" style={{ color: "#1D4E9E" }}>
                Adicionar Produto
              </ThemedText>
            </Pressable>
          </SectionCard>

          <SectionCard title="Pagamento" icon="card-outline">
            <View className="gap-two">
              <FieldLabel>Método de Pagamento</FieldLabel>
              <PaymentMethodGrid
                value={paymentMethod}
                onChange={(m) => {
                  setPaymentMethod(m);
                  setErrors({});
                }}
              />
            </View>

            {isInstallments && (
              <>
                <NumberField
                  label="Entrada (R$)"
                  icon="cash-outline"
                  decimal
                  value={downPaymentText}
                  onChangeText={setDownPaymentText}
                  error={errors.downPayment}
                />
                <View className="flex-row gap-three">
                  <NumberField
                    label="Parcelas"
                    icon="layers-outline"
                    value={installmentsText}
                    onChangeText={setInstallmentsText}
                    error={errors.installments}
                    className="flex-1"
                  />
                  <NumberField
                    label="Dia do vencimento"
                    icon="calendar-outline"
                    value={dueDayText}
                    onChangeText={setDueDayText}
                    error={errors.dueDay}
                    className="flex-1"
                  />
                </View>
              </>
            )}

            <NumberField
              label="Desconto (%)"
              icon="pricetag-outline"
              decimal
              value={discountText}
              onChangeText={setDiscountText}
            />
          </SectionCard>

          <SaleSummary
            itemCount={items.length}
            productCount={productCount}
            subtotal={subtotal}
            discount={discount}
            total={total}
            installments={
              isInstallments && installmentsCount > 0
                ? { downPayment, count: installmentsCount, value: installmentValue }
                : undefined
            }
          />
        </View>
      </KeyboardAwareScrollView>

      <SaleFooter
        total={total}
        paymentLabel={paymentMethodLabel(paymentMethod)}
        submitting={submitting}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      <ProductPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addProduct}
      />
    </View>
  );
}
