import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { BarcodeScanner } from "@/components/product/barcode-scanner";
import { CategorySelect } from "@/components/product/category-select";
import { Checkbox } from "@/components/product/checkbox";
import {
  FieldError,
  FormInput,
  FormLabel,
} from "@/components/product/form-field";
import { FormSection } from "@/components/product/form-section";
import { MarginCard } from "@/components/product/margin-card";
import { OptionChips } from "@/components/product/option-chips";
import { ProductFooter } from "@/components/product/product-footer";
import { ProductPreview } from "@/components/product/product-preview";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { parseNumber } from "@/components/sale/number-field";
import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BrandColor } from "@/constants/theme";
import type {
  CreateProductRequest,
  ProductCategory,
  StockProduct,
  UnitOfMeasure,
  UpdateProductRequest,
} from "@/interfaces/product.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { CreateProduct, UpdateProduct } from "@/service/product.service";

const SIZES = [
  { value: "P", label: "P" },
  { value: "M", label: "M" },
  { value: "G", label: "G" },
  { value: "GG", label: "GG" },
  { value: "Único", label: "Único" },
] as const;

const BULK_UNITS: { value: Exclude<UnitOfMeasure, "UN">; label: string }[] = [
  { value: "KG", label: "Quilo (kg)" },
  { value: "G", label: "Grama (g)" },
  { value: "L", label: "Litro (L)" },
  { value: "ML", label: "Mililitro (ml)" },
];

const round2 = (value: number) => Math.round(value * 100) / 100;

type FormErrors = Partial<
  Record<
    | "name"
    | "category"
    | "barcode"
    | "salePrice"
    | "description"
    | "quantity"
    | "size"
    | "costPrice",
    string
  >
>;

/** 12.5 -> "12,50"; 0 -> "" */
const priceText = (value: number) =>
  value > 0 ? value.toFixed(2).replace(".", ",") : "";

type ProductFormScreenProps = {
  /** Com produto, edita (PUT /product/:id); sem, cadastra um novo. */
  product?: StockProduct;
};

export function ProductFormScreen({ product }: ProductFormScreenProps) {
  const editing = Boolean(product);
  // Valores iniciais: na edição, os do produto (para o "descartar alterações").
  const [initial] = useState(() => ({
    name: product?.name ?? "",
    categoryId: product?.category_id ?? "",
    barcode: product?.barcode ?? "",
    description: product?.description ?? "",
    bulkUnit: (product?.sell_in_bulk && product.unit !== "UN"
      ? product.unit
      : "KG") as Exclude<UnitOfMeasure, "UN">,
    quantityText: String(product?.quantity ?? 0),
    size: product?.size ?? "",
    costText: priceText(product?.cost_price ?? 0),
    saleText: priceText(product?.sale_price ?? 0),
  }));
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState<ProductCategory | null>(() =>
    product
      ? {
          id: product.category_id,
          name: product.category_name,
          color: "",
          status: "ACTIVE",
        }
      : null,
  );
  const [noBarcode, setNoBarcode] = useState(false);
  const [barcode, setBarcode] = useState(initial.barcode);
  const [description, setDescription] = useState(initial.description);
  // A API não permite trocar `sell_in_bulk` na edição.
  const [sellInBulk, setSellInBulk] = useState(product?.sell_in_bulk ?? false);
  const [bulkUnit, setBulkUnit] = useState(initial.bulkUnit);
  const [quantityText, setQuantityText] = useState(initial.quantityText);
  const [size, setSize] = useState(initial.size);
  const [costText, setCostText] = useState(initial.costText);
  const [saleText, setSaleText] = useState(initial.saleText);
  const [errors, setErrors] = useState<FormErrors>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const quantity = parseInt(quantityText, 10) || 0;
  const costPrice = round2(parseNumber(costText));
  const salePrice = round2(parseNumber(saleText));

  const clearError = (field: keyof FormErrors) =>
    setErrors((e) => ({ ...e, [field]: undefined }));

  const isDirty = editing
    ? name !== initial.name ||
      category?.id !== initial.categoryId ||
      barcode !== initial.barcode ||
      description !== initial.description ||
      bulkUnit !== initial.bulkUnit ||
      quantityText !== initial.quantityText ||
      size !== initial.size ||
      costText !== initial.costText ||
      saleText !== initial.saleText
    : Boolean(
        name ||
        category ||
        barcode ||
        description ||
        costText ||
        saleText ||
        quantity,
      );

  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/" as Href);
  };

  const handleCancel = () => {
    if (!isDirty) return leave();
    Alert.alert(
      editing ? "Descartar alterações?" : "Descartar produto?",
      editing
        ? "As alterações não serão salvas."
        : "Os dados preenchidos serão perdidos.",
      [
        { text: "Continuar editando", style: "cancel" },
        { text: "Descartar", style: "destructive", onPress: leave },
      ],
    );
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Informe o nome do produto.";
    if (!category) next.category = "Selecione uma categoria.";
    if (!noBarcode && !barcode.trim()) {
      next.barcode =
        "Informe o código de barras ou marque “Produto sem código de barras”.";
    }
    if (salePrice <= 0) next.salePrice = "Informe o preço de venda.";
    if (product) {
      // O PUT ignora valores vazios/zerados e mantém o atual: avisa em vez de "salvar" sem efeito.
      const kept = "A edição não permite apagar este campo.";
      if (product.description && !description.trim()) next.description = kept;
      if (product.size && !sellInBulk && !size.trim()) next.size = kept;
      if (product.cost_price > 0 && costPrice <= 0)
        next.costPrice = "A edição não permite zerar o preço de custo.";
      if (!sellInBulk && product.quantity > 0 && quantity === 0) {
        next.quantity = "A edição não permite zerar o estoque.";
      }
    }
    return next;
  };

  const handleSubmit = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0 || !category) {
      Alert.alert("Campos obrigatórios", "Revise os campos destacados.");
      return;
    }

    if (product) {
      const update: UpdateProductRequest = {
        name: name.trim(),
        description: description.trim(),
        category_id: category.id,
        barcode: barcode.trim(),
        quantity: sellInBulk ? 0 : quantity,
        size: sellInBulk ? "" : size.trim(),
        cost_price: costPrice,
        sale_price: salePrice,
        unit: sellInBulk ? bulkUnit : "UN",
      };
      setSubmitting(true);
      try {
        await UpdateProduct(product.id, update);
        Alert.alert("Produto atualizado", "As alterações foram salvas.", [
          { text: "OK", onPress: leave },
        ]);
      } catch (error) {
        Alert.alert(
          "Erro ao salvar",
          getApiErrorMessage(
            error,
            "Não foi possível salvar as alterações. Tente novamente.",
          ),
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const payload: CreateProductRequest = {
      name: name.trim(),
      description: description.trim(),
      category_id: category.id,
      barcode: noBarcode ? "" : barcode.trim(),
      not_barcode: noBarcode,
      sell_in_bulk: sellInBulk,
      unit: sellInBulk ? bulkUnit : "UN",
      quantity: sellInBulk ? 0 : quantity,
      size: sellInBulk ? "" : size.trim(),
      cost_price: costPrice,
      sale_price: salePrice,
    };

    setSubmitting(true);
    try {
      await CreateProduct(payload);
      Alert.alert(
        "Produto cadastrado",
        "O produto foi adicionado ao estoque.",
        [{ text: "OK", onPress: leave }],
      );
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        getApiErrorMessage(
          error,
          "Não foi possível cadastrar o produto. Tente novamente.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title={editing ? "Editar Produto" : "Novo Produto"}
        subtitle={
          editing
            ? "Atualize os dados do produto."
            : "Cadastre novos produtos no estoque."
        }
        leading={{ type: "back", onPress: handleCancel }}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-content gap-three self-center p-three">
          <ProductPreview
            name={name}
            quantity={sellInBulk ? null : quantity}
            unit={bulkUnit.toLowerCase()}
            salePrice={salePrice}
            categoryName={category?.name}
            size={sellInBulk ? undefined : size.trim()}
          />

          <FormSection
            title="Informações básicas"
            subtitle="Dados gerais de identificação"
            icon="information-circle-outline"
            gradient={["#3B82F6", "#4F46E5"]}
          >
            <View className="gap-two">
              <FormLabel label="Nome do produto" required />
              <FormInput
                placeholder="Ex: Camiseta Básica Branca"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  clearError("name");
                }}
                error={errors.name}
                maxLength={120}
              />
              <FieldError message={errors.name} />
            </View>

            <View className="gap-two">
              <FormLabel label="Categoria" required />
              <CategorySelect
                value={category}
                onChange={(c) => {
                  setCategory(c);
                  clearError("category");
                }}
                error={errors.category}
              />
              <FieldError message={errors.category} />
            </View>

            <View className="gap-two">
              <FormLabel label="Código de barras" icon="barcode-outline" />
              {!editing && (
                <Checkbox
                  label="Produto sem código de barras"
                  checked={noBarcode}
                  onChange={(checked) => {
                    setNoBarcode(checked);
                    if (checked) setBarcode("");
                    clearError("barcode");
                  }}
                />
              )}
              <View className="flex-row gap-two">
                <View className="flex-1">
                  <FormInput
                    placeholder={
                      noBarcode
                        ? "Será gerado automaticamente"
                        : "Ex: 7891234567890"
                    }
                    value={barcode}
                    onChangeText={(t) => {
                      setBarcode(t.replace(/\s/g, ""));
                      clearError("barcode");
                    }}
                    editable={!noBarcode}
                    keyboardType="number-pad"
                    className="font-mono"
                    error={errors.barcode}
                    maxLength={48}
                  />
                </View>
                <Pressable
                  onPress={() => setScannerOpen(true)}
                  disabled={noBarcode}
                  accessibilityRole="button"
                  accessibilityLabel="Ler código de barras com a câmera"
                  className={`w-12 items-center justify-center rounded-two border border-brand-line bg-brand-soft active:opacity-70 ${noBarcode ? "opacity-40" : ""}`}
                >
                  <Ionicons name="scan-outline" size={22} color={BrandColor} />
                </Pressable>
              </View>
              <FieldError message={errors.barcode} />
            </View>

            <View className="gap-two">
              <FormLabel label="Descrição" />
              <FormInput
                placeholder="Descreva as características do produto (opcional)"
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  clearError("description");
                }}
                multiline
                maxLength={500}
                error={errors.description}
              />
              <FieldError message={errors.description} />
            </View>
          </FormSection>

          <FormSection
            title="Estoque e variação"
            subtitle="Quantidade disponível e tamanho"
            icon="cube-outline"
            gradient={["#6366F1", "#9333EA"]}
          >
            {editing ? (
              <View className="flex-row items-center gap-two rounded-two bg-surface p-three">
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#60646C"
                />
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  className="flex-1"
                >
                  {sellInBulk ? "Venda a granel" : "Venda por unidade"} — não
                  pode ser alterado depois do cadastro.
                </ThemedText>
              </View>
            ) : (
              <Checkbox
                label="Venda a granel"
                checked={sellInBulk}
                onChange={setSellInBulk}
              />
            )}

            {sellInBulk ? (
              <View className="gap-two">
                <FormLabel
                  label="Unidade de medida"
                  icon="speedometer-outline"
                />
                <OptionChips
                  options={BULK_UNITS}
                  value={bulkUnit}
                  onChange={setBulkUnit}
                />
              </View>
            ) : (
              <>
                <View className="gap-two">
                  <FormLabel label="Quantidade em estoque" />
                  <QuantityStepper
                    value={quantityText}
                    onChangeText={(t) => {
                      setQuantityText(t);
                      clearError("quantity");
                    }}
                    unit="un"
                  />
                  <FieldError message={errors.quantity} />
                </View>

                <View className="gap-two">
                  <FormLabel label="Tamanho" icon="resize-outline" />
                  <OptionChips
                    options={SIZES}
                    value={size}
                    onChange={(s) => {
                      setSize(s === size ? "" : s);
                      clearError("size");
                    }}
                  />
                  <FormInput
                    placeholder="Ou digite: Ex: 42, Único"
                    value={size}
                    onChangeText={(t) => {
                      setSize(t);
                      clearError("size");
                    }}
                    maxLength={20}
                    error={errors.size}
                  />
                  <FieldError message={errors.size} />
                </View>
              </>
            )}
          </FormSection>

          <FormSection
            title="Precificação"
            subtitle="Custo, venda e margem de lucro"
            icon="logo-usd"
            gradient={["#10B981", "#0D9488"]}
          >
            <View className="flex-row gap-three">
              <View className="flex-1 gap-two">
                <FormLabel label="Preço de custo" />
                <FormInput
                  prefix="R$"
                  placeholder="0"
                  value={costText}
                  onChangeText={(t) => {
                    setCostText(t.replace(/[^0-9.,]/g, ""));
                    clearError("costPrice");
                  }}
                  keyboardType="decimal-pad"
                  error={errors.costPrice}
                />
              </View>
              <View className="flex-1 gap-two">
                <FormLabel label="Preço de venda" required />
                <FormInput
                  prefix="R$"
                  placeholder="0"
                  value={saleText}
                  onChangeText={(t) => {
                    setSaleText(t.replace(/[^0-9.,]/g, ""));
                    clearError("salePrice");
                  }}
                  keyboardType="decimal-pad"
                  error={errors.salePrice}
                />
              </View>
            </View>
            <FieldError message={errors.costPrice} />
            <FieldError message={errors.salePrice} />
            <MarginCard costPrice={costPrice} salePrice={salePrice} />
          </FormSection>
        </View>
      </KeyboardAwareScrollView>

      <ProductFooter
        submitting={submitting}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitLabel={editing ? "Salvar alterações" : undefined}
        submittingLabel={editing ? "Salvando..." : undefined}
      />

      <BarcodeScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={(code) => {
          setBarcode(code);
          clearError("barcode");
          setScannerOpen(false);
        }}
      />
    </View>
  );
}
