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

/** `account_status_enum` da API. */
export type SaleStatus = "pending" | "paid" | "overdue" | "scheduled" | "canceled" | "partial";

/** Item de GET /sales/complete. */
export interface SaleListItem {
  sale: {
    sale_id: string;
    sale_at: string;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    installments_count: number;
    payment_method: PaymentMethod;
    sale_status: SaleStatus;
    /** UUID zero quando a venda não tem cliente (consumidor final). */
    customer_id: string;
    customer_name: string;
    down_payments: number;
  };
  products: {
    sale_item_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    item_discount: number;
    product_name: string;
  }[];
  installment: {
    installment_id: string;
    installment_balance: number;
    due_date: string;
    installment_number: number;
    installment_status: SaleStatus;
  }[];
}

/**
 * GET /sales/complete. Os totais (`sales_count`, `total_invoiced`, `total_pending`,
 * `sales_canceled`) são da empresa inteira e ignoram os filtros; `total_rows` também.
 */
export interface SaleListResponse {
  data: SaleListItem[] | null;
  page: number;
  per_page: number;
  total_rows: number;
  total_pages: number;
  sales_count: number;
  total_invoiced: number;
  total_pending: number;
  sales_canceled: number;
}

export interface SaleListParams {
  page: number;
  perPage: number;
  search: string;
  orderBy: "asc" | "desc";
  saleStatus?: SaleStatus;
  paymentMethod?: PaymentMethod;
  /** yyyy-MM-dd */
  saleStartDate?: string;
}
