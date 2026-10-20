/** Status das contas a pagar (`account_status_enum`). */
export type BillStatus =
  | "pending"
  | "overdue"
  | "scheduled"
  | "paid"
  | "partial"
  | "canceled";

/** Item de GET /bills-payable/list. */
export interface BillPayable {
  id: string;
  vendor_id: string;
  vendor_name: string;
  category_id: string;
  category_name: string;
  payment_method_id: string;
  payment_method_name: string;
  amount: number;
  amount_paid: number;
  /** "yyyy-MM-dd" */
  due_date: string;
  /** "yyyy-MM-dd" ou "" quando não agendada. */
  scheduled_date: string;
  /** "yyyy-MM-dd" ou "" quando não paga. */
  payment_date: string;
  status: BillStatus;
  description: string;
  notes: string;
  created_at: string;
}

/**
 * Os totais (`total_payable`, `total_overdue`, `total_scheduled`) e `total_rows`
 * são da empresa inteira: ignoram os filtros.
 */
export interface BillsPayableListResponse {
  data: BillPayable[] | null;
  page: number;
  per_page: number;
  total_rows: number;
  total_pages: number;
  total_payable: number;
  total_overdue: number;
  total_scheduled: number;
}

export interface BillsPayableListParams {
  page: number;
  perPage: number;
  search: string;
  status?: BillStatus;
  orderBy: "asc" | "desc";
  orderField?: "due_date" | "scheduled_date" | "payment_date" | "created_at";
  /** "yyyy-MM-dd" */
  startDueDate?: string;
  /** "yyyy-MM-dd" */
  endDueDate?: string;
}

/** POST /bills-payable — a API cria sempre como `pending` e não devolve o id. */
export interface CreateBillPayableRequest {
  vendor_id: string;
  category_id: string;
  /** Obrigatório: a API decodifica como UUID e recusa string vazia. */
  payment_method_id: string;
  amount: number;
  /** "yyyy-MM-dd" */
  due_date: string;
  description: string;
  notes: string;
}

/** GET /vendors/list/is-active */
export interface Vendor {
  id: string;
  name: string;
  is_active: boolean;
}

/** GET /bill-categories */
export interface BillCategory {
  id: string;
  name: string;
  is_active: boolean;
}
