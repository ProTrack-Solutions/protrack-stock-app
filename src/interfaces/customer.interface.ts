/** `gender_enum` da API. */
export type Gender = "MALE" | "FEMALE" | "OTHER" | "NOT_SAY";

/** POST /customers */
export interface CreateCustomerRequest {
  full_name: string;
  /** "yyyy-MM-dd" — obrigatória no banco (`birth_date DATE NOT NULL`). */
  birth_date: string;
  cpf: string;
  rg: string;
  marital_status: string;
  gender: Gender;
  whatsapp: string;
  mobile_phone: string;
  home_phone: string;
  email: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  address_country: string;
}

/** Endereço retornado pela busca de CEP. */
export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}
