import type { PaymentMethod } from "./sale.interface";

/** Status das parcelas (`accounts_receivable.status`). */
export type ReceivableStatus = "pending" | "paid" | "overdue" | "partial";

/** Item de GET /accounts-receivable/complete/list. */
export interface Receivable {
  id: string;
  customer_id: string;
  customer_name: string;
  sale_id: string;
  /** Valor original da parcela. */
  total_amount: number;
  /** Quanto ainda falta receber. */
  balance: number;
  /** "yyyy-MM-dd" */
  due_date: string;
  installment_number: number;
  total_installments: number;
  status: ReceivableStatus;
  /** Calculado pela API só para `overdue`. */
  days_overdue: number;
}

/**
 * `amount` (em aberto) e `amount_overdue` (vencido) são da empresa inteira;
 * `total_rows` também ignora os filtros.
 */
export interface ReceivableListResponse {
  data: Receivable[] | null;
  page: number;
  per_page: number;
  total_rows: number;
  total_pages: number;
  amount: number;
  amount_overdue: number;
}

export interface ReceivableListParams {
  page: number;
  perPage: number;
  search: string;
  status?: ReceivableStatus;
  orderBy: "asc" | "desc";
}

/** Forma de pagamento cadastrada na empresa (GET /payment-methods/is-active). */
export interface CompanyPaymentMethod {
  id: string;
  name: string;
  type: PaymentMethod;
  is_active: boolean;
}

/**
 * POST /payments — a API abate o valor das parcelas pendentes do cliente, em ordem,
 * e recusa valores acima do saldo devedor. Não recebe data (registra no momento).
 */
export interface CreatePaymentRequest {
  customer_id: string;
  payment_method_id: string;
  amount_paid: number;
  notes: string;
}
