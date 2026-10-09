import { router, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { CustomerPreview } from "@/components/customer/customer-preview";
import { SelectField } from "@/components/customer/select-field";
import { Checkbox } from "@/components/product/checkbox";
import {
  FieldError,
  FormInput,
  FormLabel,
} from "@/components/product/form-field";
import { FormSection } from "@/components/product/form-section";
import { ProductFooter } from "@/components/product/product-footer";
import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import type {
  CreateCustomerRequest,
  Gender,
} from "@/interfaces/customer.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { CreateCustomer, LookupCep } from "@/service/customer.service";
import {
  isValidCpf,
  isValidEmail,
  maskCep,
  maskCpf,
  maskDate,
  maskPhone,
  maskRg,
  parseBrDate,
} from "@/utils/masks";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
  { value: "NOT_SAY", label: "Prefiro não informar" },
];

// Mesmos valores do web.
const MARITAL_STATUSES = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União Estável" },
] as const;

const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((uf) => ({ value: uf, label: uf }));

type Form = {
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: string;
  email: string;
  whatsapp: string;
  mobileSameAsWhatsapp: boolean;
  mobilePhone: string;
  homePhone: string;
  zipcode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
};

const INITIAL_FORM: Form = {
  fullName: "",
  cpf: "",
  rg: "",
  birthDate: "",
  gender: "NOT_SAY",
  maritalStatus: "",
  email: "",
  whatsapp: "",
  mobileSameAsWhatsapp: true,
  mobilePhone: "",
  homePhone: "",
  zipcode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
};

type FormErrors = Partial<
  Record<"fullName" | "cpf" | "birthDate" | "email" | "zipcode", string>
>;

export default function NewCustomerScreen() {
  const [form, setForm] = useState<Form>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [searchingCep, setSearchingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof Form>(field: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const isDirty = (Object.keys(INITIAL_FORM) as (keyof Form)[]).some(
    (key) => form[key] !== INITIAL_FORM[key],
  );

  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/" as Href);
  };

  const handleCancel = () => {
    if (!isDirty) return leave();
    Alert.alert("Descartar cliente?", "Os dados preenchidos serão perdidos.", [
      { text: "Continuar editando", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: leave },
    ]);
  };

  const searchCep = async () => {
    if (form.zipcode.replace(/\D/g, "").length !== 8) {
      setErrors((e) => ({ ...e, zipcode: "Informe um CEP com 8 dígitos." }));
      return;
    }
    setSearchingCep(true);
    try {
      const address = await LookupCep(form.zipcode);
      if (!address) {
        setErrors((e) => ({ ...e, zipcode: "CEP não encontrado." }));
        return;
      }
      setForm((f) => ({
        ...f,
        street: address.street || f.street,
        neighborhood: address.neighborhood || f.neighborhood,
        city: address.city || f.city,
        state: address.state || f.state,
      }));
    } catch {
      setErrors((e) => ({
        ...e,
        zipcode:
          "Não foi possível buscar o CEP. Preencha o endereço manualmente.",
      }));
    } finally {
      setSearchingCep(false);
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = "Informe o nome completo.";
    if (!form.cpf) next.cpf = "Informe o CPF.";
    else if (!isValidCpf(form.cpf)) next.cpf = "CPF inválido.";
    // A API exige a data (`birth_date` NOT NULL no banco).
    if (!form.birthDate) next.birthDate = "Informe a data de nascimento.";
    else if (!parseBrDate(form.birthDate))
      next.birthDate = "Data inválida. Use dd/mm/aaaa.";
    if (!form.email.trim()) next.email = "Informe o email.";
    else if (!isValidEmail(form.email.trim())) next.email = "Email inválido.";
    return next;
  };

  const handleSubmit = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      Alert.alert("Campos obrigatórios", "Revise os campos destacados.");
      return;
    }

    const payload: CreateCustomerRequest = {
      full_name: form.fullName.trim(),
      birth_date: parseBrDate(form.birthDate) ?? "",
      cpf: form.cpf,
      rg: form.rg,
      marital_status: form.maritalStatus,
      gender: form.gender,
      whatsapp: form.whatsapp,
      mobile_phone: form.mobileSameAsWhatsapp
        ? form.whatsapp
        : form.mobilePhone,
      home_phone: form.homePhone,
      email: form.email.trim().toLowerCase(),
      address_street: form.street.trim(),
      address_number: form.number.trim(),
      address_complement: form.complement.trim(),
      address_neighborhood: form.neighborhood.trim(),
      address_city: form.city.trim(),
      address_state: form.state,
      address_zipcode: form.zipcode,
      address_country: form.country.trim(),
    };

    setSubmitting(true);
    try {
      await CreateCustomer(payload);
      Alert.alert(
        "Cliente cadastrado",
        "O cliente foi cadastrado com sucesso.",
        [{ text: "OK", onPress: leave }],
      );
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        getApiErrorMessage(
          error,
          "Não foi possível cadastrar o cliente. Tente novamente.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const genderLabel = GENDERS.find((g) => g.value === form.gender)?.label ?? "";
  const addressSummary = [
    [form.street.trim(), form.number.trim()].filter(Boolean).join(", "),
    [form.city.trim(), form.state].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Novo Cliente"
        subtitle="Preencha os dados para cadastrar um cliente."
        leading={{ type: "back", onPress: handleCancel }}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-content gap-three self-center p-three">
          <CustomerPreview
            name={form.fullName}
            cpf={form.cpf}
            genderLabel={genderLabel}
            email={form.email}
            address={addressSummary}
          />

          <FormSection
            title="Informações pessoais"
            subtitle="Dados de identificação do cliente"
            icon="information-circle-outline"
            gradient={["#3B82F6", "#4F46E5"]}
          >
            <View className="gap-two">
              <FormLabel label="Nome completo" required />
              <FormInput
                placeholder="Digite o nome completo"
                value={form.fullName}
                onChangeText={(t) => set("fullName", t)}
                autoCapitalize="words"
                maxLength={100}
                error={errors.fullName}
              />
              <FieldError message={errors.fullName} />
            </View>

            <View className="flex-row gap-three">
              <View className="flex-1 gap-two">
                <FormLabel label="CPF" required />
                <FormInput
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChangeText={(t) => set("cpf", maskCpf(t))}
                  keyboardType="number-pad"
                  error={errors.cpf}
                />
              </View>
              <View className="flex-1 gap-two">
                <FormLabel label="RG" />
                <FormInput
                  placeholder="00.000.000-0"
                  value={form.rg}
                  onChangeText={(t) => set("rg", maskRg(t))}
                  autoCapitalize="characters"
                />
              </View>
            </View>
            <FieldError message={errors.cpf} />

            <View className="gap-two">
              <FormLabel
                label="Data de nascimento"
                icon="calendar-outline"
                required
              />
              <FormInput
                placeholder="dd/mm/aaaa"
                value={form.birthDate}
                onChangeText={(t) => set("birthDate", maskDate(t))}
                keyboardType="number-pad"
                error={errors.birthDate}
              />
              <FieldError message={errors.birthDate} />
            </View>

            <View className="gap-two">
              <FormLabel label="Gênero" />
              <View className="flex-row flex-wrap gap-two">
                {GENDERS.map((option) => {
                  const selected = option.value === form.gender;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => set("gender", option.value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`grow basis-[45%] items-center rounded-two border px-two py-three active:opacity-70 ${
                        selected
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-paper"
                      }`}
                    >
                      <ThemedText
                        type="smallBold"
                        className={selected ? "text-brand" : undefined}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-two">
              <FormLabel label="Estado civil" />
              <SelectField
                title="Estado civil"
                placeholder="Selecione o estado civil"
                options={MARITAL_STATUSES}
                value={form.maritalStatus}
                onChange={(v) => set("maritalStatus", v)}
              />
            </View>
          </FormSection>

          <FormSection
            title="Contato"
            subtitle="Telefones e email para comunicação"
            icon="call-outline"
            gradient={["#6366F1", "#9333EA"]}
          >
            <View className="gap-two">
              <FormLabel label="Email" icon="mail-outline" required />
              <FormInput
                placeholder="nome@email.com"
                value={form.email}
                onChangeText={(t) => set("email", t.replace(/\s/g, ""))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={100}
                error={errors.email}
              />
              <FieldError message={errors.email} />
            </View>

            <View className="gap-two">
              <FormLabel label="WhatsApp" icon="logo-whatsapp" />
              <FormInput
                placeholder="(00) 00000-0000"
                value={form.whatsapp}
                onChangeText={(t) => set("whatsapp", maskPhone(t))}
                keyboardType="phone-pad"
              />
              <Checkbox
                label="Celular é o mesmo número"
                checked={form.mobileSameAsWhatsapp}
                onChange={(checked) => set("mobileSameAsWhatsapp", checked)}
              />
            </View>

            {!form.mobileSameAsWhatsapp && (
              <View className="gap-two">
                <FormLabel label="Celular" icon="phone-portrait-outline" />
                <FormInput
                  placeholder="(00) 00000-0000"
                  value={form.mobilePhone}
                  onChangeText={(t) => set("mobilePhone", maskPhone(t))}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View className="gap-two">
              <FormLabel label="Telefone fixo" />
              <FormInput
                placeholder="(00) 0000-0000"
                value={form.homePhone}
                onChangeText={(t) => set("homePhone", maskPhone(t))}
                keyboardType="phone-pad"
              />
            </View>
          </FormSection>

          <FormSection
            title="Endereço"
            subtitle="Localização completa do cliente"
            icon="location-outline"
            gradient={["#10B981", "#0D9488"]}
          >
            <View className="gap-two">
              <FormLabel label="CEP" />
              <View className="flex-row gap-two">
                <View className="flex-1">
                  <FormInput
                    placeholder="00000-000"
                    value={form.zipcode}
                    onChangeText={(t) => set("zipcode", maskCep(t))}
                    keyboardType="number-pad"
                    returnKeyType="search"
                    onSubmitEditing={searchCep}
                    error={errors.zipcode}
                  />
                </View>
                <Pressable
                  onPress={searchCep}
                  disabled={searchingCep}
                  accessibilityRole="button"
                  className="min-w-28 items-center justify-center rounded-two border border-emerald-200 bg-emerald-50 px-three active:opacity-70"
                >
                  {searchingCep ? (
                    <ActivityIndicator color="#047857" />
                  ) : (
                    <ThemedText type="smallBold" className="text-emerald-700">
                      Buscar CEP
                    </ThemedText>
                  )}
                </Pressable>
              </View>
              <FieldError message={errors.zipcode} />
            </View>

            <View className="gap-two">
              <FormLabel label="Rua / Avenida" />
              <FormInput
                placeholder="Ex: Av. Paulista"
                value={form.street}
                onChangeText={(t) => set("street", t)}
                maxLength={150}
              />
            </View>

            <View className="flex-row gap-three">
              <View className="w-24 gap-two">
                <FormLabel label="Número" />
                <FormInput
                  placeholder="Nº"
                  value={form.number}
                  onChangeText={(t) => set("number", t)}
                  maxLength={20}
                />
              </View>
              <View className="flex-1 gap-two">
                <FormLabel label="Complemento" />
                <FormInput
                  placeholder="Apto, bloco (opcional)"
                  value={form.complement}
                  onChangeText={(t) => set("complement", t)}
                  maxLength={100}
                />
              </View>
            </View>

            <View className="gap-two">
              <FormLabel label="Bairro" />
              <FormInput
                placeholder="Ex: Centro"
                value={form.neighborhood}
                onChangeText={(t) => set("neighborhood", t)}
                maxLength={100}
              />
            </View>

            <View className="flex-row gap-three">
              <View className="flex-1 gap-two">
                <FormLabel label="Cidade" />
                <FormInput
                  placeholder="Ex: São Paulo"
                  value={form.city}
                  onChangeText={(t) => set("city", t)}
                  maxLength={100}
                />
              </View>
              <View className="w-24 gap-two">
                <FormLabel label="Estado" />
                <SelectField
                  title="Estado"
                  placeholder="UF"
                  options={STATES}
                  value={form.state}
                  onChange={(v) => set("state", v)}
                />
              </View>
            </View>

            <View className="gap-two">
              <FormLabel label="País" />
              <FormInput
                placeholder="Brasil"
                value={form.country}
                onChangeText={(t) => set("country", t)}
                maxLength={50}
              />
            </View>
          </FormSection>
        </View>
      </KeyboardAwareScrollView>

      <ProductFooter
        submitting={submitting}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitLabel="Cadastrar Cliente"
      />
    </View>
  );
}
