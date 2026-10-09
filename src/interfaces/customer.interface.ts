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

export type CustomerStatusFilter = "all" | "active" | "inactive";

/** Cliente como a API devolve em GET /customers/list e GET /customers/:id. */
export interface Customer {
  id: string;
  full_name: string;
  /** "yyyy-MM-dd" */
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
  balance_due: number;
  created_at: string;
  /** "0001-01-01T00:00:00Z" quando o cliente está ativo (a API não manda `null`). */
  deleted_at: string;
}

/** PUT /customers/:id — a API grava `balance_due` também, então ele precisa ir com o valor atual. */
export type UpdateCustomerRequest = CreateCustomerRequest & {
  balance_due: number;
};

export interface CustomerListResponse {
  /** `null` quando não há resultados. */
  data: Customer[] | null;
  page: number;
  per_page: number;
  /**
   * Atenção: a API sempre devolve o total de clientes ATIVOS da empresa,
   * ignorando busca, status e datas. Não serve para paginar.
   */
  total_rows: number;
  total_pages: number;
}

export interface CustomerListParams {
  page: number;
  perPage: number;
  search: string;
  status: CustomerStatusFilter;
  orderBy: "asc" | "desc";
  startDate?: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  newThisMonth: number;
}
