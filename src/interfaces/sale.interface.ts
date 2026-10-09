// Formatos espelhados do protrack-api (internal/sales, customers e products).

export type PaymentMethod =
  | "cash"
  | "pix"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "installments"
  | "other";

export interface PaginatedResponse<T> {
  /** A API devolve `null` quando a lista está vazia. */
  data: T[] | null;
  page: number;
  per_page: number;
  total_rows: number;
  total_pages: number;
}

export interface Customer {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  mobile_phone: string;
  balance_due: number;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  /** Quantidade em estoque. */
  quantity: number;
  sale_price: number;
  unit: string;
  category_name: string;
}

export interface SaleItem {
  product: Product;
  quantity: number;
}

/** POST /sales */
export interface CreateSaleRequest {
  customer_id?: string;
  /** Desconto em reais. */
  discount_amount: number;
  payment_method: PaymentMethod;
  items: { product_id: string; quantity: number }[];
  /** Apenas para crediário (`installments`). */
  installments_count?: number;
  /** Dia do mês de vencimento das parcelas (crediário). */
  due_days?: number;
  /** Valor de entrada do crediário. */
  prohibited?: number;
}

export interface CreateSaleResponse {
  id: string;
}

/** Parâmetros para abrir a venda com o cliente já selecionado (ex: a partir da tela de clientes). */
export type NewSaleParams = {
  customerId?: string;
  customerName?: string;
  customerCpf?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerBalance?: string;
};
